<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Cart Item Model
 * Moved to Ecommerce module
 */
final class CartItem extends Model
{
    use HasFactory;

    protected $table = 'cart_items';

    protected $fillable = [
        'cart_id', 'variant_id', 'quantity',
    ];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Subtotal per item (in cents)
     */
    public function subtotal(): int
    {
        return $this->variant->price * $this->quantity;
    }
}

