<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $customer_id
 * @property string $email
 * @property string|null $first_name
 * @property string $locale
 * @property string $token
 * @property array<array-key, mixed>|null $tags
 * @property bool $consent_given
 * @property CarbonImmutable|null $consent_given_at
 * @property string|null $consent_ip
 * @property string|null $consent_source
 * @property bool $is_active
 * @property CarbonImmutable|null $unsubscribed_at
 * @property string|null $unsubscribe_reason
 * @property bool $is_bounced
 * @property CarbonImmutable|null $bounced_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, NewsletterClick> $clicks
 * @property-read int|null $clicks_count
 * @property-read Collection<int, NewsletterOpen> $opens
 * @property-read int|null $opens_count
 * @property-read Collection<int, NewsletterSend> $sends
 * @property-read int|null $sends_count
 *
 * @method static Builder<static>|NewsletterSubscriber newModelQuery()
 * @method static Builder<static>|NewsletterSubscriber newQuery()
 * @method static Builder<static>|NewsletterSubscriber query()
 * @method static Builder<static>|NewsletterSubscriber whereBouncedAt($value)
 * @method static Builder<static>|NewsletterSubscriber whereConsentGiven($value)
 * @method static Builder<static>|NewsletterSubscriber whereConsentGivenAt($value)
 * @method static Builder<static>|NewsletterSubscriber whereConsentIp($value)
 * @method static Builder<static>|NewsletterSubscriber whereConsentSource($value)
 * @method static Builder<static>|NewsletterSubscriber whereCreatedAt($value)
 * @method static Builder<static>|NewsletterSubscriber whereCustomerId($value)
 * @method static Builder<static>|NewsletterSubscriber whereEmail($value)
 * @method static Builder<static>|NewsletterSubscriber whereFirstName($value)
 * @method static Builder<static>|NewsletterSubscriber whereId($value)
 * @method static Builder<static>|NewsletterSubscriber whereIsActive($value)
 * @method static Builder<static>|NewsletterSubscriber whereIsBounced($value)
 * @method static Builder<static>|NewsletterSubscriber whereLocale($value)
 * @method static Builder<static>|NewsletterSubscriber whereTags($value)
 * @method static Builder<static>|NewsletterSubscriber whereToken($value)
 * @method static Builder<static>|NewsletterSubscriber whereUnsubscribeReason($value)
 * @method static Builder<static>|NewsletterSubscriber whereUnsubscribedAt($value)
 * @method static Builder<static>|NewsletterSubscriber whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'customer_id', 'email', 'first_name', 'locale', 'token', 'tags',
    'consent_given', 'consent_given_at', 'consent_ip', 'consent_source',
    'is_active', 'unsubscribed_at', 'unsubscribe_reason',
    'is_bounced', 'bounced_at',
])]
#[Table(name: 'newsletter_subscribers')]
class NewsletterSubscriber extends Model
{
    use HasFactory;

    /**
     * @return BelongsTo<Customer, $this>
     */
    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * @return HasMany<NewsletterSend, $this>
     */
    /**
     * @return HasMany<NewsletterSend, $this>
     */
    public function sends(): HasMany
    {
        return $this->hasMany(NewsletterSend::class);
    }

    /**
     * @return HasMany<NewsletterOpen, $this>
     */
    /**
     * @return HasMany<NewsletterOpen, $this>
     */
    public function opens(): HasMany
    {
        return $this->hasMany(NewsletterOpen::class);
    }

    /**
     * @return HasMany<NewsletterClick, $this>
     */
    /**
     * @return HasMany<NewsletterClick, $this>
     */
    public function clicks(): HasMany
    {
        return $this->hasMany(NewsletterClick::class);
    }

    public function unsubscribe(?string $reason = null): void
    {
        $this->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
            'unsubscribe_reason' => $reason,
        ]);
    }

    public function hasTag(string $tag): bool
    {
        return $this->tags && in_array($tag, $this->tags);
    }

    /**
     * @return BelongsToMany<NewsletterSegment, $this>
     */
    public function segments(): BelongsToMany
    {
        return $this->belongsToMany(NewsletterSegment::class, 'newsletter_segment_subscriber');
    }

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'consent_given' => 'boolean',
            'consent_given_at' => 'datetime',
            'is_active' => 'boolean',
            'unsubscribed_at' => 'datetime',
            'is_bounced' => 'boolean',
            'bounced_at' => 'datetime',
        ];
    }
}
