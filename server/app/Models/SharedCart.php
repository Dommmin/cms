<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\SharedCartFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $source_cart_id
 * @property int|null $customer_id
 * @property string $public_token
 * @property string $currency_code
 * @property string|null $locale
 * @property string|null $discount_code
 * @property array<string, mixed> $snapshot
 * @property CarbonImmutable|null $expires_at
 * @property int $uses_count
 * @property CarbonImmutable|null $last_used_at
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Cart|null $sourceCart
 * @property-read Customer|null $customer
 *
 * @method static SharedCartFactory factory($count = null, $state = [])
 * @method static Builder<static>|SharedCart newModelQuery()
 * @method static Builder<static>|SharedCart newQuery()
 * @method static Builder<static>|SharedCart query()
 * @method static Builder<static>|SharedCart whereCreatedAt($value)
 * @method static Builder<static>|SharedCart whereCurrencyCode($value)
 * @method static Builder<static>|SharedCart whereCustomerId($value)
 * @method static Builder<static>|SharedCart whereDiscountCode($value)
 * @method static Builder<static>|SharedCart whereExpiresAt($value)
 * @method static Builder<static>|SharedCart whereId($value)
 * @method static Builder<static>|SharedCart whereIsActive($value)
 * @method static Builder<static>|SharedCart whereLastUsedAt($value)
 * @method static Builder<static>|SharedCart whereLocale($value)
 * @method static Builder<static>|SharedCart wherePublicToken($value)
 * @method static Builder<static>|SharedCart whereSnapshot($value)
 * @method static Builder<static>|SharedCart whereSourceCartId($value)
 * @method static Builder<static>|SharedCart whereUpdatedAt($value)
 * @method static Builder<static>|SharedCart whereUsesCount($value)
 *
 * @mixin Model
 */
#[Fillable([
    'source_cart_id',
    'customer_id',
    'public_token',
    'currency_code',
    'locale',
    'discount_code',
    'snapshot',
    'expires_at',
    'uses_count',
    'last_used_at',
    'is_active',
])]
#[Table(name: 'shared_carts')]
class SharedCart extends Model
{
    use HasFactory;

    public function sourceCart(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'source_cart_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'expires_at' => 'immutable_datetime',
            'last_used_at' => 'immutable_datetime',
            'is_active' => 'boolean',
        ];
    }
}
