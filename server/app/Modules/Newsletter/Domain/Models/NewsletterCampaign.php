<?php

declare(strict_types=1);

namespace App\Modules\Newsletter\Domain\Models;

use App\Enums\AudienceType;
use App\Enums\CampaignStatus;
use App\Enums\CampaignTrigger;
use App\Enums\CampaignType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class NewsletterCampaign extends Model
{
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
        'audience_type' => AudienceType::class,
        'type'          => CampaignType::class,
        'status'        => CampaignStatus::class,
        'trigger'       => CampaignTrigger::class,
        'target_tags'   => 'array',
        'scheduled_at'  => 'datetime',
        'started_sending_at'  => 'datetime',
        'finished_sending_at' => 'datetime',
    ];

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
        if ($this->total_sent === 0) return 0;
        return round(($this->total_opened / $this->total_sent) * 100, 1);
    }

    /** Click rate v % */
    public function clickRate(): float
    {
        if ($this->total_sent === 0) return 0;
        return round(($this->total_clicked / $this->total_sent) * 100, 1);
    }
}

