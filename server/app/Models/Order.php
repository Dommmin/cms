<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\OrderStatusEnum;
use App\Events\OrderCreated;
use App\Events\OrderDelivered;
use App\Events\OrderPaid;
use App\Events\OrderShipped;
use App\Notifications\OrderStatusChangedNotification;
use App\States\Order\AwaitingPaymentState;
use App\States\Order\CancelledState;
use App\States\Order\DeliveredState;
use App\States\Order\OrderState;
use App\States\Order\PaidState;
use App\States\Order\PendingState;
use App\States\Order\ProcessingState;
use App\States\Order\RefundedState;
use App\States\Order\ShippedState;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\ModelStates\Exceptions\TransitionNotAllowed;
use Spatie\ModelStates\HasStates;

class Order extends Model
{
    use HasFactory;
    use HasStates;
    use LogsActivity;

    protected $table = 'orders';

    protected $fillable = [
        'reference_number', 'customer_id', 'guest_email', 'billing_address_id', 'shipping_address_id',
        'status', 'subtotal', 'discount_amount', 'shipping_cost', 'tax_amount', 'total',
        'currency_code', 'exchange_rate', 'notes',
    ];

    protected $dispatchesEvents = [
        'created' => OrderCreated::class,
    ];

    /**
     * Generate unique reference number
     */
    public static function generateReferenceNumber(): string
    {
        $year = date('Y');
        $number = self::query()->where('reference_number', 'like', sprintf('ORD-%s-%%', $year))
            ->count() + 1;

        return sprintf('ORD-%s-%05d', $year, $number);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('order');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function billingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->latest('changed_at');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(ReturnRequest::class);
    }

    /**
     * Change status and log in history. Throws TransitionNotAllowed for invalid transitions.
     */
    public function changeStatus(OrderStatusEnum $newStatus, string $changedBy = 'system', ?string $notes = null): void
    {
        $previousStatus = $this->status instanceof OrderState
            ? $this->status->getValue()
            : (string) $this->status;

        $stateClass = $this->enumToStateClass($newStatus);

        $this->status->transitionTo($stateClass);

        $this->statusHistory()->create([
            'previous_status' => $previousStatus,
            'new_status' => $newStatus->value,
            'changed_by' => $changedBy,
            'notes' => $notes,
            'changed_at' => now(),
        ]);

        match ($newStatus) {
            OrderStatusEnum::PAID => event(new OrderPaid($this)),
            OrderStatusEnum::SHIPPED => event(new OrderShipped($this)),
            OrderStatusEnum::DELIVERED => event(new OrderDelivered($this)),
            default => null,
        };

        $user = $this->customer?->user;
        if ($user) {
            $user->notify(new OrderStatusChangedNotification($this, $newStatus));
        }
    }

    /**
     * Formatted total price
     */
    public function formattedTotal(): string
    {
        $currency = Currency::query()->where('code', $this->currency_code)->first() ?? Currency::base();

        return $currency->format($this->total);
    }

    protected function casts(): array
    {
        return [
            'status' => OrderState::class,
        ];
    }

    /** @throws TransitionNotAllowed */
    private function enumToStateClass(OrderStatusEnum $enum): string
    {
        return match ($enum) {
            OrderStatusEnum::PENDING => PendingState::class,
            OrderStatusEnum::AWAITING => AwaitingPaymentState::class,
            OrderStatusEnum::PAID => PaidState::class,
            OrderStatusEnum::PROCESSING => ProcessingState::class,
            OrderStatusEnum::SHIPPED => ShippedState::class,
            OrderStatusEnum::DELIVERED => DeliveredState::class,
            OrderStatusEnum::CANCELLED => CancelledState::class,
            OrderStatusEnum::REFUNDED => RefundedState::class,
        };
    }
}
