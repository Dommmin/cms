<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Discount extends Model
{
    protected $table = 'discounts';

    protected $fillable = [
        'code', 'name', 'type', 'value', 'apply_to',
        'min_order_value', 'max_uses', 'uses_count', 'max_uses_per_customer',
        'starts_at', 'ends_at', 'is_active',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'starts_at'  => 'datetime',
        'ends_at'    => 'datetime',
    ];

    public function conditions(): HasMany
    {
        return $this->hasMany(DiscountCondition::class);
    }

    public function isValid(): bool
    {
        if (!$this->is_active) return false;
        if (now()->before($this->starts_at)) return false;
        if ($this->ends_at && now()->after($this->ends_at)) return false;
        if ($this->max_uses && $this->uses_count >= $this->max_uses) return false;

        return true;
    }

    /** Oblicza wartość rabatu w groszy */
    public function calculateDiscount(int $subtotalCents): int
    {
        return match($this->type) {
            'percentage'   => (int) round($subtotalCents * ($this->value / 100)),
            'fixed_amount' => min($this->value, $subtotalCents),
            'free_shipping' => 0, // Obsługa odbywa się przy obliczaniu shipping cost
            default => 0,
        };
    }
}

