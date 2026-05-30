<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $endpoint
 * @property string|null $public_key
 * @property string|null $auth_token
 * @property string|null $content_encoding
 * @property int|null $user_id
 * @property string|null $user_agent
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $user
 *
 * @method static Builder<static>|PushSubscription active()
 * @method static Builder<static>|PushSubscription newModelQuery()
 * @method static Builder<static>|PushSubscription newQuery()
 * @method static Builder<static>|PushSubscription query()
 * @method static Builder<static>|PushSubscription whereAuthToken($value)
 * @method static Builder<static>|PushSubscription whereContentEncoding($value)
 * @method static Builder<static>|PushSubscription whereCreatedAt($value)
 * @method static Builder<static>|PushSubscription whereEndpoint($value)
 * @method static Builder<static>|PushSubscription whereId($value)
 * @method static Builder<static>|PushSubscription whereIsActive($value)
 * @method static Builder<static>|PushSubscription wherePublicKey($value)
 * @method static Builder<static>|PushSubscription whereUpdatedAt($value)
 * @method static Builder<static>|PushSubscription whereUserAgent($value)
 * @method static Builder<static>|PushSubscription whereUserId($value)
 *
 * @mixin Model
 */
#[Fillable([
    'user_id',
    'endpoint',
    'public_key',
    'auth_token',
    'content_encoding',
    'user_agent',
    'is_active',
])]
final class PushSubscription extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
