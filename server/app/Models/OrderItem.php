<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Order Item Model
 * Moved to Ecommerce module
 *
 * @property int $id
 * @property int $order_id
 * @property int|null $variant_id
 * @property string $product_name
 * @property string|null $variant_name
 * @property string $sku
 * @property int $quantity
 * @property int $unit_price
 * @property int $total_price
 * @property int $shipped_quantity
 * @property int|null $product_id
 * @property-read ProductVariant|null $variant
 * @property-read int $remaining_to_ship
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Order $order
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ShipmentItem> $shipmentItems
 * @property-read int|null $shipment_items_count
 * @method static \Database\Factories\OrderItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereProductName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereShippedQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereSku($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereTotalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereVariantId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereVariantName($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'order_id', 'variant_id', 'product_name', 'variant_name',
    'sku', 'quantity', 'unit_price', 'total_price', 'shipped_quantity',
])]
#[Table(name: 'order_items')]
class OrderItem extends Model
{
    use HasFactory;

    /**
     * Create snapshot from current variant data
     */
    public static function fromVariant(ProductVariant $variant, int $quantity): array
    {
        return [
            'variant_id' => $variant->id,
            'product_name' => $variant->product->name,
            'variant_name' => $variant->name,
            'sku' => $variant->sku,
            'quantity' => $quantity,
            'unit_price' => $variant->price,
            'total_price' => $variant->price * $quantity,
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function shipmentItems(): HasMany
    {
        return $this->hasMany(ShipmentItem::class);
    }

    public function isFullyShipped(): bool
    {
        return $this->shipped_quantity >= $this->quantity;
    }

    protected function getRemainingToShipAttribute(): int
    {
        return max(0, $this->quantity - $this->shipped_quantity);
    }
}
