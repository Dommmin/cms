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

    protected function getRemainingToShipAttribute(): int
    {
        return max(0, $this->quantity - $this->shipped_quantity);
    }

    public function isFullyShipped(): bool
    {
        return $this->shipped_quantity >= $this->quantity;
    }
}
