<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $code
 * @property string $discount_type
 * @property int $discount_value Percentage (0-100) or fixed amount in cents
 * @property numeric $commission_rate Commission percentage paid to affiliate
 * @property int|null $max_uses null = unlimited
 * @property int $uses_count
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $expires_at
 * @property string|null $notes
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Referral> $referrals
 * @property-read int|null $referrals_count
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereDiscountType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereDiscountValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereMaxUses($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AffiliateCode whereUsesCount($value)
 * @mixin \Eloquent
 */
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
