<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Database\Factories\WebhookFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property int $id
 * @property string $name
 * @property string $url
 * @property string $secret
 * @property array $events
 * @property bool $is_active
 * @property string|null $description
 * @property int $failure_count
 * @property Carbon|null $last_triggered_at
 * @property Collection<int, WebhookDelivery> $deliveries
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property CarbonImmutable|null $deleted_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read int|null $deliveries_count
 *
 * @method static WebhookFactory factory($count = null, $state = [])
 * @method static Builder<static>|Webhook newModelQuery()
 * @method static Builder<static>|Webhook newQuery()
 * @method static Builder<static>|Webhook onlyTrashed()
 * @method static Builder<static>|Webhook query()
 * @method static Builder<static>|Webhook whereCreatedAt($value)
 * @method static Builder<static>|Webhook whereDeletedAt($value)
 * @method static Builder<static>|Webhook whereDescription($value)
 * @method static Builder<static>|Webhook whereEvents($value)
 * @method static Builder<static>|Webhook whereFailureCount($value)
 * @method static Builder<static>|Webhook whereId($value)
 * @method static Builder<static>|Webhook whereIsActive($value)
 * @method static Builder<static>|Webhook whereLastTriggeredAt($value)
 * @method static Builder<static>|Webhook whereName($value)
 * @method static Builder<static>|Webhook whereSecret($value)
 * @method static Builder<static>|Webhook whereUpdatedAt($value)
 * @method static Builder<static>|Webhook whereUrl($value)
 * @method static Builder<static>|Webhook withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|Webhook withoutTrashed()
 *
 * @mixin Model
 */
#[Fillable([
    'name',
    'url',
    'secret',
    'events',
    'is_active',
    'description',
    'last_triggered_at',
    'failure_count',
])]
final class Webhook extends Model
{
    use HasFactory;
    use LogsActivity;
    use SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['url', 'events', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('webhook');
    }

    /**
     * @return HasMany<WebhookDelivery, $this>
     */
    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class);
    }

    protected static function booted(): void
    {
        self::creating(static function (Webhook $webhook): void {
            $webhook->secret ??= bin2hex(random_bytes(32));
        });
    }

    protected function casts(): array
    {
        return [
            'events' => 'array',
            'is_active' => 'boolean',
            'failure_count' => 'integer',
            'last_triggered_at' => 'datetime',
        ];
    }
}
