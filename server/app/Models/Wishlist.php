<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $customer_id
 * @property string|null $session_token
 * @property string $name
 * @property string|null $token
 * @property bool $is_public
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, WishlistItem> $items
 * @property-read int|null $items_count
 *
 * @method static Builder<static>|Wishlist newModelQuery()
 * @method static Builder<static>|Wishlist newQuery()
 * @method static Builder<static>|Wishlist query()
 * @method static Builder<static>|Wishlist whereCreatedAt($value)
 * @method static Builder<static>|Wishlist whereCustomerId($value)
 * @method static Builder<static>|Wishlist whereId($value)
 * @method static Builder<static>|Wishlist whereIsPublic($value)
 * @method static Builder<static>|Wishlist whereName($value)
 * @method static Builder<static>|Wishlist whereSessionToken($value)
 * @method static Builder<static>|Wishlist whereToken($value)
 * @method static Builder<static>|Wishlist whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'customer_id', 'name', 'session_token', 'token', 'is_public',
])]
#[Table(name: 'wishlists')]
class Wishlist extends Model
{
    use HasFactory;

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }
}
