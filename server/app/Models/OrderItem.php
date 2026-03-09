<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Order Item Model
 * Moved to Ecommerce module
 */
class OrderItem extends Model
{
    use HasFactory;

    protected $table = 'order_items';

    protected $fillable = [
        'order_id', 'variant_id', 'product_name', 'variant_name',
        'sku', 'quantity', 'unit_price', 'total_price',
    ];

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
}
