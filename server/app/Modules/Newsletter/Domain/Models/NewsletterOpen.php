<?php

declare(strict_types=1);

namespace App\Modules\Newsletter\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class NewsletterOpen extends Model
{
    protected $table = 'newsletter_opens';

    protected $fillable = [
        'newsletter_campaign_id', 'newsletter_subscriber_id',
        'ip_address', 'user_agent', 'opened_at',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
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

