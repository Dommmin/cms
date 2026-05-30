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
 * @property string $channel
 * @property string $event
 * @property bool $is_enabled
 * @property int|null $user_id
 * @property int|null $customer_id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read User|null $user
 *
 * @method static Builder<static>|NotificationPreference newModelQuery()
 * @method static Builder<static>|NotificationPreference newQuery()
 * @method static Builder<static>|NotificationPreference query()
 * @method static Builder<static>|NotificationPreference whereChannel($value)
 * @method static Builder<static>|NotificationPreference whereCreatedAt($value)
 * @method static Builder<static>|NotificationPreference whereCustomerId($value)
 * @method static Builder<static>|NotificationPreference whereEvent($value)
 * @method static Builder<static>|NotificationPreference whereId($value)
 * @method static Builder<static>|NotificationPreference whereIsEnabled($value)
 * @method static Builder<static>|NotificationPreference whereUpdatedAt($value)
 * @method static Builder<static>|NotificationPreference whereUserId($value)
 *
 * @mixin Model
 */
#[Fillable([
    'user_id',
    'customer_id',
    'channel',
    'event',
    'is_enabled',
])]
class NotificationPreference extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
        ];
    }
}
