<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AudienceTypeEnum;
use App\Enums\CampaignStatusEnum;
use App\Enums\CampaignTriggerEnum;
use App\Enums\CampaignTypeEnum;
use Carbon\Carbon;
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
 * @property string $status
 * @property string $trigger
 * @property int|null $trigger_delay_hours
 * @property Carbon|null $scheduled_at
 * @property Carbon|null $created_at
 * @property int $total_sent
 * @property int $sends_count
 */
class NewsletterCampaign extends Model
{
    use HasFactory;

    protected $table = 'newsletter_campaigns';

    protected $fillable = [
        'name', 'subject', 'preview_text', 'sender_name', 'sender_email',
        'html_content', 'plain_text_content', 'audience_type', 'newsletter_segment_id',
        'target_tags', 'type', 'status', 'trigger', 'trigger_delay_hours',
        'scheduled_at', 'started_sending_at', 'finished_sending_at',
        'total_recipients', 'total_sent', 'total_delivered', 'total_opened',
        'total_clicked', 'total_bounced', 'total_unsubscribed',
    ];

    protected $casts = [
        'audience_type' => AudienceTypeEnum::class,
        'type' => CampaignTypeEnum::class,
        'status' => CampaignStatusEnum::class,
        'trigger' => CampaignTriggerEnum::class,
        'target_tags' => 'array',
        'scheduled_at' => 'datetime',
        'started_sending_at' => 'datetime',
        'finished_sending_at' => 'datetime',
    ];

    /** @var array<int, string> */
    protected $appends = ['sends_count'];

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
}
