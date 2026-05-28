<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SubscriptionStatusEnum;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $status
 * @property Carbon|null $trial_ends_at
 * @property Carbon|null $expires_at
 * @property bool $auto_renew
 * @property int $billing_cycle_count
 * @property SubscriptionPlan $plan
 * @property int $customer_id
 * @property int $subscription_plan_id
 * @property \Carbon\CarbonImmutable $starts_at
 * @property \Carbon\CarbonImmutable|null $cancelled_at
 * @property \Carbon\CarbonImmutable|null $paused_at
 * @property \Carbon\CarbonImmutable|null $next_billing_at
 * @property int $billing_price
 * @property string|null $payment_method_id
 * @property int $Billing_cycle_count
 * @property array<array-key, mixed>|null $metadata
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Customer|null $customer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $orders
 * @property-read int|null $orders_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription expired()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereAutoRenew($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereBillingCycleCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereBillingPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereCancelledAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereNextBillingAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription wherePausedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription wherePaymentMethodId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereStartsAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereSubscriptionPlanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereTrialEndsAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
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
])]
final class Subscription extends Model
{
    use HasFactory;

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
