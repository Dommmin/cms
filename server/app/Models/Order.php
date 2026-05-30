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
use App\States\Order\DraftState;
use App\States\Order\OrderState;
use App\States\Order\PaidState;
use App\States\Order\PendingState;
use App\States\Order\ProcessingState;
use App\States\Order\RefundedState;
use App\States\Order\ShippedState;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\ModelStates\HasStates;

/**
 * @property int $id
 * @property string $reference_number
 * @property string|null $invoice_number
 * @property Carbon|null $invoice_issued_at
 * @property string|null $buyer_vat_id
 * @property string|null $buyer_company_name
 * @property OrderState $status
 * @property int $subtotal
 * @property int $shipping_cost
 * @property int $discount_amount
 * @property int $tax_amount
 * @property int $total
 * @property string $currency_code
 * @property string|null $notes
 * @property string|null $guest_email
 * @property Carbon $created_at
 * @property Collection<int, OrderItem> $items
 * @property Customer|null $customer
 * @property Shipment|null $shipment
 * @property Payment|null $payment
 * @property Collection $returns
 * @property int|null $customer_id
 * @property int $billing_address_id
 * @property int $shipping_address_id
 * @property numeric $exchange_rate
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Address $billingAddress
 * @property-read int|null $items_count
 * @property-read int|null $returns_count
 * @property-read Collection<int, Shipment> $shipments
 * @property-read int|null $shipments_count
 * @property-read Address $shippingAddress
 * @property-read Collection<int, OrderStatusHistory> $statusHistory
 * @property-read int|null $status_history_count
 *
 * @method static OrderFactory factory($count = null, $state = [])
 * @method static Builder<static>|Order newModelQuery()
 * @method static Builder<static>|Order newQuery()
 * @method static Builder<static>|Order orWhereNotState(string $column, $states)
 * @method static Builder<static>|Order orWhereState(string $column, $states)
 * @method static Builder<static>|Order query()
 * @method static Builder<static>|Order whereBillingAddressId($value)
 * @method static Builder<static>|Order whereBuyerCompanyName($value)
 * @method static Builder<static>|Order whereBuyerVatId($value)
 * @method static Builder<static>|Order whereCreatedAt($value)
 * @method static Builder<static>|Order whereCurrencyCode($value)
 * @method static Builder<static>|Order whereCustomerId($value)
 * @method static Builder<static>|Order whereDiscountAmount($value)
 * @method static Builder<static>|Order whereExchangeRate($value)
 * @method static Builder<static>|Order whereGuestEmail($value)
 * @method static Builder<static>|Order whereId($value)
 * @method static Builder<static>|Order whereInvoiceIssuedAt($value)
 * @method static Builder<static>|Order whereInvoiceNumber($value)
 * @method static Builder<static>|Order whereNotState(string $column, $states)
 * @method static Builder<static>|Order whereNotes($value)
 * @method static Builder<static>|Order whereReferenceNumber($value)
 * @method static Builder<static>|Order whereShippingAddressId($value)
 * @method static Builder<static>|Order whereShippingCost($value)
 * @method static Builder<static>|Order whereState(string $column, $states)
 * @method static Builder<static>|Order whereStatus($value)
 * @method static Builder<static>|Order whereSubtotal($value)
 * @method static Builder<static>|Order whereTaxAmount($value)
 * @method static Builder<static>|Order whereTotal($value)
 * @method static Builder<static>|Order whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'reference_number', 'invoice_number', 'invoice_issued_at', 'buyer_vat_id', 'buyer_company_name',
    'customer_id', 'guest_email', 'billing_address_id', 'shipping_address_id',
    'status', 'subtotal', 'discount_amount', 'shipping_cost', 'tax_amount', 'total',
    'currency_code', 'exchange_rate', 'notes',
])]
#[Table(name: 'orders')]
class Order extends Model
{
    use HasFactory;
    use HasStates;
    use LogsActivity;

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

    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * @return BelongsTo<Address, $this>
     */
    public function billingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    /**
     * @return BelongsTo<Address, $this>
     */
    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return HasMany<OrderStatusHistory, $this>
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->latest('changed_at');
    }

    /**
     * @return HasOne<Payment, $this>
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * @return HasOne<Shipment, $this>
     */
    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class)->latestOfMany();
    }

    /**
     * @return HasMany<Shipment, $this>
     */
    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    /**
     * @return HasMany<ReturnRequest, $this>
     */
    public function returns(): HasMany
    {
        return $this->hasMany(ReturnRequest::class);
    }

    /**
     * Change status and log in history. Throws TransitionNotAllowed for invalid transitions.
     */
    public function changeStatus(OrderStatusEnum $newStatus, string $changedBy = 'system', ?string $notes = null): void
    {
        $previousStatus = $this->status->getValue();

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
            'invoice_issued_at' => 'datetime',
        ];
    }

    private function enumToStateClass(OrderStatusEnum $enum): string
    {
        return match ($enum) {
            OrderStatusEnum::DRAFT => DraftState::class,
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
