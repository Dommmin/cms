<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $wishlist_id
 * @property int $product_variant_id
 * @property string|null $notes
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductVariant $variant
 * @property-read Wishlist $wishlist
 *
 * @method static Builder<static>|WishlistItem newModelQuery()
 * @method static Builder<static>|WishlistItem newQuery()
 * @method static Builder<static>|WishlistItem query()
 * @method static Builder<static>|WishlistItem whereCreatedAt($value)
 * @method static Builder<static>|WishlistItem whereId($value)
 * @method static Builder<static>|WishlistItem whereNotes($value)
 * @method static Builder<static>|WishlistItem whereProductVariantId($value)
 * @method static Builder<static>|WishlistItem whereUpdatedAt($value)
 * @method static Builder<static>|WishlistItem whereWishlistId($value)
 *
 * @mixin Model
 */
#[Fillable([
    'wishlist_id', 'product_variant_id', 'notes',
])]
#[Table(name: 'wishlist_items')]
class WishlistItem extends Model
{
    use HasFactory;

    public function wishlist(): BelongsTo
    {
        return $this->belongsTo(Wishlist::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
