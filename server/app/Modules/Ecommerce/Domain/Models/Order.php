<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Enums\OrderStatus;
use App\Modules\Core\Domain\Models\Address;
use App\Modules\Core\Domain\Models\Currency;
use App\Modules\Core\Domain\Models\Customer;
use App\Modules\Ecommerce\Domain\Events\OrderCreated;
use App\Modules\Ecommerce\Domain\Events\OrderDelivered;
use App\Modules\Ecommerce\Domain\Events\OrderPaid;
use App\Modules\Ecommerce\Domain\Events\OrderShipped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Order Model
 * Moved to Ecommerce module
 */
final class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'reference_number', 'customer_id', 'billing_address_id', 'shipping_address_id',
        'status', 'subtotal', 'discount_amount', 'shipping_cost', 'tax_amount', 'total',
        'currency_code', 'exchange_rate', 'notes',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
    ];

    protected $dispatchesEvents = [
        'created' => OrderCreated::class,
    ];

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
        return $this->hasMany(OrderStatusHistory::class)->orderByDesc('changed_at');
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
        return $this->hasMany(\App\Modules\Ecommerce\Domain\Models\ReturnRequest::class);
    }

    /**
     * Change status and log in history
     */
    public function changeStatus(OrderStatus $newStatus, string $changedBy = 'system', ?string $notes = null): void
    {
        $previousStatus = $this->status->value;

        $this->update(['status' => $newStatus->value]);

        $this->statusHistory()->create([
            'previous_status' => $previousStatus,
            'new_status' => $newStatus->value,
            'changed_by' => $changedBy,
            'notes' => $notes,
            'changed_at' => now(),
        ]);

        // Dispatch events based on status
        match ($newStatus) {
            OrderStatus::Paid => event(new OrderPaid($this)),
            OrderStatus::Shipped => event(new OrderShipped($this)),
            OrderStatus::Delivered => event(new OrderDelivered($this)),
            default => null,
        };
    }

    /**
     * Generate unique reference number
     */
    public static function generateReferenceNumber(): string
    {
        $year = date('Y');
        $number = self::where('reference_number', 'like', "ORD-{$year}-%")
            ->count() + 1;

        return sprintf('ORD-%s-%05d', $year, $number);
    }

    /**
     * Formatted total price
     */
    public function formattedTotal(): string
    {
        $currency = Currency::where('code', $this->currency_code)->first() ?? Currency::base();
        return $currency->format($this->total);
    }
}

