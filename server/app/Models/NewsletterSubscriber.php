<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Core\Domain\Models\Customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NewsletterSubscriber extends Model
{
    use HasFactory;

    protected $table = 'newsletter_subscribers';

    protected $fillable = [
        'customer_id', 'email', 'first_name', 'locale', 'token', 'tags',
        'consent_given', 'consent_given_at', 'consent_ip', 'consent_source',
        'is_active', 'unsubscribed_at', 'unsubscribe_reason',
        'is_bounced', 'bounced_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'consent_given' => 'boolean',
        'consent_given_at' => 'datetime',
        'is_active' => 'boolean',
        'unsubscribed_at' => 'datetime',
        'is_bounced' => 'boolean',
        'bounced_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
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
}
