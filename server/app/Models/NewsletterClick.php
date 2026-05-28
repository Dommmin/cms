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
 * @property string $url
 * @property string $tracking_token
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Carbon\CarbonImmutable $clicked_at
 * @property-read \App\Models\NewsletterCampaign|null $campaign
 * @property-read \App\Models\NewsletterSubscriber|null $subscriber
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick whereClickedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick whereNewsletterCampaignId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick whereNewsletterSubscriberId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick whereTrackingToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick whereUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterClick whereUserAgent($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'newsletter_campaign_id', 'newsletter_subscriber_id', 'url',
    'tracking_token', 'ip_address', 'user_agent', 'clicked_at',
])]
#[Table(name: 'newsletter_clicks')]
class NewsletterClick extends Model
{
    use HasFactory;

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
