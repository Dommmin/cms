<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Core\Domain\Models\Customer;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
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
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\WishlistItem> $items
 * @property-read int|null $items_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist whereIsPublic($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist whereSessionToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist whereToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Wishlist whereUpdatedAt($value)
 * @mixin \Eloquent
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
