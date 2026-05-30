<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\CartFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $session_token
 * @property Collection<int, CartItem> $items
 * @property int|null $customer_id
 * @property string|null $discount_code
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read int|null $items_count
 *
 * @method static CartFactory factory($count = null, $state = [])
 * @method static Builder<static>|Cart newModelQuery()
 * @method static Builder<static>|Cart newQuery()
 * @method static Builder<static>|Cart query()
 * @method static Builder<static>|Cart whereCreatedAt($value)
 * @method static Builder<static>|Cart whereCustomerId($value)
 * @method static Builder<static>|Cart whereDiscountCode($value)
 * @method static Builder<static>|Cart whereId($value)
 * @method static Builder<static>|Cart whereSessionToken($value)
 * @method static Builder<static>|Cart whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Guarded(['id'])]
#[Table(name: 'carts')]
class Cart extends Model
{
    use HasFactory;

    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * @return HasMany<CartItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class)->with('variant.product');
    }

    /**
     * Sum of items in cents (without shipping, without discount)
     */
    public function subtotal(): int
    {
        return (int) $this->items->sum(fn (CartItem $item): int => $item->unitPrice() * $item->quantity);
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
