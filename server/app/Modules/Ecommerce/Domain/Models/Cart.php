<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Modules\Core\Domain\Models\Customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Cart Model
 * Moved to Ecommerce module
 */
final class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $fillable = [
        'customer_id', 'session_token', 'discount_code',
    ];

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
        return (int) $this->items->sum(fn (CartItem $item) =>
            $item->variant->price * $item->quantity
        );
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

