<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $price
 * @property string $currency
 * @property string $billing_period
 * @property int $billing_cycle
 * @property int $trial_days
 * @property string $name
 * @property string|null $description
 * @property array<array-key, mixed>|null $features
 * @property bool $is_active
 * @property int $sort_order
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Subscription> $subscriptions
 * @property-read int|null $subscriptions_count
 *
 * @method static Builder<static>|SubscriptionPlan newModelQuery()
 * @method static Builder<static>|SubscriptionPlan newQuery()
 * @method static Builder<static>|SubscriptionPlan query()
 * @method static Builder<static>|SubscriptionPlan whereBillingCycle($value)
 * @method static Builder<static>|SubscriptionPlan whereBillingPeriod($value)
 * @method static Builder<static>|SubscriptionPlan whereCreatedAt($value)
 * @method static Builder<static>|SubscriptionPlan whereCurrency($value)
 * @method static Builder<static>|SubscriptionPlan whereDescription($value)
 * @method static Builder<static>|SubscriptionPlan whereFeatures($value)
 * @method static Builder<static>|SubscriptionPlan whereId($value)
 * @method static Builder<static>|SubscriptionPlan whereIsActive($value)
 * @method static Builder<static>|SubscriptionPlan whereName($value)
 * @method static Builder<static>|SubscriptionPlan wherePrice($value)
 * @method static Builder<static>|SubscriptionPlan whereSortOrder($value)
 * @method static Builder<static>|SubscriptionPlan whereTrialDays($value)
 * @method static Builder<static>|SubscriptionPlan whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name',
    'description',
    'price',
    'currency',
    'billing_period',
    'billing_cycle',
    'trial_days',
    'features',
    'is_active',
    'sort_order',
])]
final class SubscriptionPlan extends Model
{
    use HasFactory;

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function formattedPrice(): string
    {
        $amount = $this->price / 100;

        return match ($this->currency) {
            'PLN' => number_format($amount, 2, ',', ' ').' zł',
            'EUR' => '€'.number_format($amount, 2, '.', ','),
            'USD' => '$'.number_format($amount, 2, '.', ','),
            default => number_format($amount, 2, '.', ' ').' '.$this->currency,
        };
    }

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'features' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
