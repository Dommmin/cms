<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AudienceTypeEnum;
use App\Enums\CampaignStatusEnum;
use App\Enums\CampaignTriggerEnum;
use App\Enums\CampaignTypeEnum;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Database\Factories\NewsletterCampaignFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
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
 * @property string $name
 * @property string $subject
 * @property string|null $preview_text
 * @property string $sender_email
 * @property string $sender_name
 * @property string $html_content
 * @property string|null $plain_text_content
 * @property string $audience_type
 * @property string $type
 * @property CampaignStatusEnum $status
 * @property CampaignTriggerEnum|null $trigger
 * @property int|null $trigger_delay_hours
 * @property Carbon|null $scheduled_at
 * @property Carbon|null $created_at
 * @property int $total_sent
 * @property int $sends_count
 * @property int|null $newsletter_segment_id
 * @property array<array-key, mixed>|null $target_tags
 * @property CarbonImmutable|null $started_sending_at
 * @property CarbonImmutable|null $finished_sending_at
 * @property int $total_recipients
 * @property int $total_delivered
 * @property int $total_opened
 * @property int $total_clicked
 * @property int $total_bounced
 * @property int $total_unsubscribed
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, NewsletterClick> $clicks
 * @property-read int|null $clicks_count
 * @property-read Collection<int, NewsletterOpen> $opens
 * @property-read int|null $opens_count
 * @property-read NewsletterSegment|null $segment
 * @property-read Collection<int, NewsletterSend> $sends
 *
 * @method static NewsletterCampaignFactory factory($count = null, $state = [])
 * @method static Builder<static>|NewsletterCampaign newModelQuery()
 * @method static Builder<static>|NewsletterCampaign newQuery()
 * @method static Builder<static>|NewsletterCampaign query()
 * @method static Builder<static>|NewsletterCampaign whereAudienceType($value)
 * @method static Builder<static>|NewsletterCampaign whereCreatedAt($value)
 * @method static Builder<static>|NewsletterCampaign whereFinishedSendingAt($value)
 * @method static Builder<static>|NewsletterCampaign whereHtmlContent($value)
 * @method static Builder<static>|NewsletterCampaign whereId($value)
 * @method static Builder<static>|NewsletterCampaign whereName($value)
 * @method static Builder<static>|NewsletterCampaign whereNewsletterSegmentId($value)
 * @method static Builder<static>|NewsletterCampaign wherePlainTextContent($value)
 * @method static Builder<static>|NewsletterCampaign wherePreviewText($value)
 * @method static Builder<static>|NewsletterCampaign whereScheduledAt($value)
 * @method static Builder<static>|NewsletterCampaign whereSenderEmail($value)
 * @method static Builder<static>|NewsletterCampaign whereSenderName($value)
 * @method static Builder<static>|NewsletterCampaign whereStartedSendingAt($value)
 * @method static Builder<static>|NewsletterCampaign whereStatus($value)
 * @method static Builder<static>|NewsletterCampaign whereSubject($value)
 * @method static Builder<static>|NewsletterCampaign whereTargetTags($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalBounced($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalClicked($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalDelivered($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalOpened($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalRecipients($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalSent($value)
 * @method static Builder<static>|NewsletterCampaign whereTotalUnsubscribed($value)
 * @method static Builder<static>|NewsletterCampaign whereTrigger($value)
 * @method static Builder<static>|NewsletterCampaign whereTriggerDelayHours($value)
 * @method static Builder<static>|NewsletterCampaign whereType($value)
 * @method static Builder<static>|NewsletterCampaign whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Appends(['sends_count'])]
#[Fillable([
    'name', 'subject', 'preview_text', 'sender_name', 'sender_email',
    'html_content', 'plain_text_content', 'audience_type', 'newsletter_segment_id',
    'target_tags', 'type', 'status', 'trigger', 'trigger_delay_hours',
    'scheduled_at', 'started_sending_at', 'finished_sending_at',
    'total_recipients', 'total_sent', 'total_delivered', 'total_opened',
    'total_clicked', 'total_bounced', 'total_unsubscribed',
])]
#[Table(name: 'newsletter_campaigns')]
class NewsletterCampaign extends Model
{
    use HasFactory;

    public function segment(): BelongsTo
    {
        return $this->belongsTo(NewsletterSegment::class);
    }

    public function sends(): HasMany
    {
        return $this->hasMany(NewsletterSend::class);
    }

    public function opens(): HasMany
    {
        return $this->hasMany(NewsletterOpen::class);
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(NewsletterClick::class);
    }

    /** Open rate v % */
    public function openRate(): float
    {
        if ($this->total_sent === 0) {
            return 0;
        }

        return round(($this->total_opened / $this->total_sent) * 100, 1);
    }

    /** Click rate v % */
    public function clickRate(): float
    {
        if ($this->total_sent === 0) {
            return 0;
        }

        return round(($this->total_clicked / $this->total_sent) * 100, 1);
    }

    protected function casts(): array
    {
        return [
            'audience_type' => AudienceTypeEnum::class,
            'type' => CampaignTypeEnum::class,
            'status' => CampaignStatusEnum::class,
            'trigger' => CampaignTriggerEnum::class,
            'target_tags' => 'array',
            'scheduled_at' => 'datetime',
            'started_sending_at' => 'datetime',
            'finished_sending_at' => 'datetime',
        ];
    }
}
