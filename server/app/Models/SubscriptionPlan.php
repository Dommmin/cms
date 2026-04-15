<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
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
