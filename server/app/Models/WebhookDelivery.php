<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\WebhookDeliveryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $webhook_id
 * @property string $event
 * @property array<array-key, mixed> $payload
 * @property string $status
 * @property int $attempt
 * @property int|null $response_status
 * @property string|null $response_body
 * @property int|null $duration_ms
 * @property CarbonImmutable|null $delivered_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Webhook|null $webhook
 *
 * @method static WebhookDeliveryFactory factory($count = null, $state = [])
 * @method static Builder<static>|WebhookDelivery newModelQuery()
 * @method static Builder<static>|WebhookDelivery newQuery()
 * @method static Builder<static>|WebhookDelivery query()
 * @method static Builder<static>|WebhookDelivery whereAttempt($value)
 * @method static Builder<static>|WebhookDelivery whereCreatedAt($value)
 * @method static Builder<static>|WebhookDelivery whereDeliveredAt($value)
 * @method static Builder<static>|WebhookDelivery whereDurationMs($value)
 * @method static Builder<static>|WebhookDelivery whereEvent($value)
 * @method static Builder<static>|WebhookDelivery whereId($value)
 * @method static Builder<static>|WebhookDelivery wherePayload($value)
 * @method static Builder<static>|WebhookDelivery whereResponseBody($value)
 * @method static Builder<static>|WebhookDelivery whereResponseStatus($value)
 * @method static Builder<static>|WebhookDelivery whereStatus($value)
 * @method static Builder<static>|WebhookDelivery whereUpdatedAt($value)
 * @method static Builder<static>|WebhookDelivery whereWebhookId($value)
 *
 * @mixin Model
 */
#[Fillable([
    'webhook_id',
    'event',
    'payload',
    'status',
    'attempt',
    'response_status',
    'response_body',
    'duration_ms',
    'delivered_at',
])]
final class WebhookDelivery extends Model
{
    use HasFactory;

    public function webhook(): BelongsTo
    {
        return $this->belongsTo(Webhook::class);
    }

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'delivered_at' => 'datetime',
        ];
    }
}
