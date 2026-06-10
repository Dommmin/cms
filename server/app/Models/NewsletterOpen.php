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
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property CarbonImmutable $opened_at
 * @property-read NewsletterCampaign|null $campaign
 * @property-read NewsletterSubscriber|null $subscriber
 *
 * @method static Builder<static>|NewsletterOpen newModelQuery()
 * @method static Builder<static>|NewsletterOpen newQuery()
 * @method static Builder<static>|NewsletterOpen query()
 * @method static Builder<static>|NewsletterOpen whereId($value)
 * @method static Builder<static>|NewsletterOpen whereIpAddress($value)
 * @method static Builder<static>|NewsletterOpen whereNewsletterCampaignId($value)
 * @method static Builder<static>|NewsletterOpen whereNewsletterSubscriberId($value)
 * @method static Builder<static>|NewsletterOpen whereOpenedAt($value)
 * @method static Builder<static>|NewsletterOpen whereUserAgent($value)
 *
 * @mixin Model
 */
#[Fillable([
    'newsletter_campaign_id', 'newsletter_subscriber_id',
    'ip_address', 'user_agent', 'opened_at',
])]
#[Table(name: 'newsletter_opens')]
class NewsletterOpen extends Model
{
    use HasFactory;

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(NewsletterCampaign::class);
    }

    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(NewsletterSubscriber::class);
    }

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
        ];
    }
}
