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
 * @property int $newsletter_campaign_id
 * @property int $newsletter_subscriber_id
 * @property string $status
 * @property string|null $message_id
 * @property string|null $error_message
 * @property CarbonImmutable|null $sent_at
 * @property CarbonImmutable|null $delivered_at
 * @property CarbonImmutable|null $failed_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read NewsletterCampaign|null $campaign
 * @property-read NewsletterSubscriber|null $subscriber
 *
 * @method static Builder<static>|NewsletterSend newModelQuery()
 * @method static Builder<static>|NewsletterSend newQuery()
 * @method static Builder<static>|NewsletterSend query()
 * @method static Builder<static>|NewsletterSend whereCreatedAt($value)
 * @method static Builder<static>|NewsletterSend whereDeliveredAt($value)
 * @method static Builder<static>|NewsletterSend whereErrorMessage($value)
 * @method static Builder<static>|NewsletterSend whereFailedAt($value)
 * @method static Builder<static>|NewsletterSend whereId($value)
 * @method static Builder<static>|NewsletterSend whereMessageId($value)
 * @method static Builder<static>|NewsletterSend whereNewsletterCampaignId($value)
 * @method static Builder<static>|NewsletterSend whereNewsletterSubscriberId($value)
 * @method static Builder<static>|NewsletterSend whereSentAt($value)
 * @method static Builder<static>|NewsletterSend whereStatus($value)
 * @method static Builder<static>|NewsletterSend whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'newsletter_campaign_id', 'newsletter_subscriber_id', 'status',
    'message_id', 'error_message', 'sent_at', 'delivered_at', 'failed_at',
])]
#[Table(name: 'newsletter_sends')]
class NewsletterSend extends Model
{
    use HasFactory;

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(NewsletterCampaign::class);
    }

    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(NewsletterSubscriber::class);
    }
}
