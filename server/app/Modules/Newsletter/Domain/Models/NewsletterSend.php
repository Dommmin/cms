<?php

declare(strict_types=1);

namespace App\Modules\Newsletter\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class NewsletterSend extends Model
{
    protected $table = 'newsletter_sends';

    protected $fillable = [
        'newsletter_campaign_id', 'newsletter_subscriber_id', 'status',
        'message_id', 'error_message', 'sent_at', 'delivered_at', 'failed_at',
    ];

    protected $casts = [
        'sent_at'      => 'datetime',
        'delivered_at' => 'datetime',
        'failed_at'    => 'datetime',
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

