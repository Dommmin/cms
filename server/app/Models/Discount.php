<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

#[Fillable([
    'code', 'name', 'type', 'value', 'apply_to',
    'min_order_value', 'max_uses', 'uses_count', 'max_uses_per_customer',
    'starts_at', 'ends_at', 'is_active',
])]
#[Table(name: 'discounts')]
class Discount extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['code', 'type', 'value', 'is_active', 'ends_at', 'max_uses'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('discount');
    }

    public function conditions(): HasMany
    {
        return $this->hasMany(DiscountCondition::class);
    }

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->starts_at && now()->lt($this->starts_at)) {
            return false;
        }

        if ($this->ends_at && now()->gt($this->ends_at)) {
            return false;
        }

        return ! ($this->max_uses && $this->uses_count >= $this->max_uses);
    }

    /** Oblicza wartość rabatu w groszy */
    public function calculateDiscount(int $subtotalCents): int
    {
        return match ($this->type) {
            'percentage' => (int) round($subtotalCents * ($this->value / 100)),
            'fixed_amount' => min($this->value, $subtotalCents),
            'free_shipping' => 0, // Obsługa odbywa się przy obliczaniu shipping cost
            default => 0,
        };
    }
}
