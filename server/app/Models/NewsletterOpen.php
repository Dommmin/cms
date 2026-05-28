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
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Carbon\CarbonImmutable $opened_at
 * @property-read \App\Models\NewsletterCampaign|null $campaign
 * @property-read \App\Models\NewsletterSubscriber|null $subscriber
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterOpen newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterOpen newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterOpen query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterOpen whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterOpen whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterOpen whereNewsletterCampaignId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterOpen whereNewsletterSubscriberId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterOpen whereOpenedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterOpen whereUserAgent($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'newsletter_campaign_id', 'newsletter_subscriber_id',
    'ip_address', 'user_agent', 'opened_at',
])]
#[Table(name: 'newsletter_opens')]
class NewsletterOpen extends Model
{
    use HasFactory;

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
