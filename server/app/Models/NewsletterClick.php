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
 * @property string $url
 * @property string $tracking_token
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property CarbonImmutable $clicked_at
 * @property-read NewsletterCampaign|null $campaign
 * @property-read NewsletterSubscriber|null $subscriber
 *
 * @method static Builder<static>|NewsletterClick newModelQuery()
 * @method static Builder<static>|NewsletterClick newQuery()
 * @method static Builder<static>|NewsletterClick query()
 * @method static Builder<static>|NewsletterClick whereClickedAt($value)
 * @method static Builder<static>|NewsletterClick whereId($value)
 * @method static Builder<static>|NewsletterClick whereIpAddress($value)
 * @method static Builder<static>|NewsletterClick whereNewsletterCampaignId($value)
 * @method static Builder<static>|NewsletterClick whereNewsletterSubscriberId($value)
 * @method static Builder<static>|NewsletterClick whereTrackingToken($value)
 * @method static Builder<static>|NewsletterClick whereUrl($value)
 * @method static Builder<static>|NewsletterClick whereUserAgent($value)
 *
 * @mixin Model
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
