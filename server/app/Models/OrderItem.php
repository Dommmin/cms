<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Order $order
 * @property-read Collection<int, ShipmentItem> $shipmentItems
 * @property-read int|null $shipment_items_count
 *
 * @method static OrderItemFactory factory($count = null, $state = [])
 * @method static Builder<static>|OrderItem newModelQuery()
 * @method static Builder<static>|OrderItem newQuery()
 * @method static Builder<static>|OrderItem query()
 * @method static Builder<static>|OrderItem whereCreatedAt($value)
 * @method static Builder<static>|OrderItem whereId($value)
 * @method static Builder<static>|OrderItem whereOrderId($value)
 * @method static Builder<static>|OrderItem whereProductName($value)
 * @method static Builder<static>|OrderItem whereQuantity($value)
 * @method static Builder<static>|OrderItem whereShippedQuantity($value)
 * @method static Builder<static>|OrderItem whereSku($value)
 * @method static Builder<static>|OrderItem whereTotalPrice($value)
 * @method static Builder<static>|OrderItem whereUnitPrice($value)
 * @method static Builder<static>|OrderItem whereUpdatedAt($value)
 * @method static Builder<static>|OrderItem whereVariantId($value)
 * @method static Builder<static>|OrderItem whereVariantName($value)
 *
 * @mixin Model
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
