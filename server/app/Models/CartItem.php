<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $table = 'cart_items';

    protected $guarded = ['id'];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Unit price for current quantity, respecting tiered pricing.
     */
    public function unitPrice(): int
    {
        return $this->variant->getPriceForQuantity($this->quantity);
    }

    /**
     * Subtotal per item (in cents)
     */
    public function subtotal(): int
    {
        return $this->unitPrice() * $this->quantity;
    }
}
