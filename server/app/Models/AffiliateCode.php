<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'code',
    'discount_type',
    'discount_value',
    'commission_rate',
    'max_uses',
    'uses_count',
    'is_active',
    'expires_at',
    'notes',
])]
class AffiliateCode extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class);
    }

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses !== null && $this->uses_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    /** Calculate discount amount in cents based on cart subtotal. */
    public function calculateDiscount(int $subtotal): int
    {
        return match ($this->discount_type) {
            'percentage' => (int) round($subtotal * $this->discount_value / 100),
            'fixed' => min($subtotal, $this->discount_value),
            default => 0,
        };
    }

    /** Calculate commission amount in cents based on order total after discount. */
    public function calculateCommission(int $orderTotal): int
    {
        return (int) round($orderTotal * (float) $this->commission_rate / 100);
    }

    protected function casts(): array
    {
        return [
            'discount_value' => 'integer',
            'commission_rate' => 'decimal:2',
            'max_uses' => 'integer',
            'uses_count' => 'integer',
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }
}
