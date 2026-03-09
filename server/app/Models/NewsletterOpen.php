<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsletterOpen extends Model
{
    use HasFactory;

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
