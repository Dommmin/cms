<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $guarded = ['id'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class)->with('variant.product');
    }

    /**
     * Sum of items in cents (without shipping, without discount)
     */
    public function subtotal(): int
    {
        return (int) $this->items->sum(fn (CartItem $item): int => $item->variant ? $item->unitPrice() * $item->quantity : 0);
    }

    /**
     * Item count
     */
    public function itemCount(): int
    {
        return (int) $this->items->sum('quantity');
    }

    public function isEmpty(): bool
    {
        return $this->items->isEmpty();
    }
}
