<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SubscriptionStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'subscription_plan_id',
        'status',
        'starts_at',
        'expires_at',
        'trial_ends_at',
        'cancelled_at',
        'paused_at',
        'next_billing_at',
        'billing_price',
        'payment_method_id',
        'billing_cycle_count',
        'auto_renew',
        'metadata',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isActive(): bool
    {
        return $this->status->isActive();
    }

    public function isOnTrial(): bool
    {
        return $this->status === SubscriptionStatusEnum::Trial
            && $this->trial_ends_at
            && $this->trial_ends_at->isFuture();
    }

    public function daysUntilExpiration(): int
    {
        if (! $this->expires_at) {
            return 0;
        }

        return (int) now()->diffInDays($this->expires_at, false);
    }

    protected function scopeActive($query)
    {
        return $query->whereIn('status', [
            SubscriptionStatusEnum::Active->value,
            SubscriptionStatusEnum::Trial->value,
        ]);
    }

    protected function scopeExpired($query)
    {
        return $query->where('status', SubscriptionStatusEnum::Expired->value);
    }

    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatusEnum::class,
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'paused_at' => 'datetime',
            'next_billing_at' => 'datetime',
            'billing_price' => 'integer',
            'billing_cycle_count' => 'integer',
            'auto_renew' => 'boolean',
            'metadata' => 'array',
        ];
    }
}
