<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
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
 * @property \Carbon\CarbonImmutable|null $sent_at
 * @property \Carbon\CarbonImmutable|null $delivered_at
 * @property \Carbon\CarbonImmutable|null $failed_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\NewsletterCampaign|null $campaign
 * @property-read \App\Models\NewsletterSubscriber|null $subscriber
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereDeliveredAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereErrorMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereFailedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereMessageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereNewsletterCampaignId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereNewsletterSubscriberId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereSentAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSend whereUpdatedAt($value)
 * @mixin \Eloquent
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
