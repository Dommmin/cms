<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\CartItemFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $cart_id
 * @property int $variant_id
 * @property int $quantity
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Cart $cart
 * @property-read ProductVariant $variant
 *
 * @method static CartItemFactory factory($count = null, $state = [])
 * @method static Builder<static>|CartItem newModelQuery()
 * @method static Builder<static>|CartItem newQuery()
 * @method static Builder<static>|CartItem query()
 * @method static Builder<static>|CartItem whereCartId($value)
 * @method static Builder<static>|CartItem whereCreatedAt($value)
 * @method static Builder<static>|CartItem whereId($value)
 * @method static Builder<static>|CartItem whereQuantity($value)
 * @method static Builder<static>|CartItem whereUpdatedAt($value)
 * @method static Builder<static>|CartItem whereVariantId($value)
 *
 * @mixin Model
 */
#[Guarded(['id'])]
#[Table(name: 'cart_items')]
class CartItem extends Model
{
    use HasFactory;

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
