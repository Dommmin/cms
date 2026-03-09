<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsletterClick extends Model
{
    use HasFactory;

    protected $table = 'newsletter_clicks';

    protected $fillable = [
        'newsletter_campaign_id', 'newsletter_subscriber_id', 'url',
        'tracking_token', 'ip_address', 'user_agent', 'clicked_at',
    ];

    protected $casts = [
        'clicked_at' => 'datetime',
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
