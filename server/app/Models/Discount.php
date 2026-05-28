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

/**
 * @property int $id
 * @property string|null $code
 * @property string $name
 * @property string $type
 * @property int $value
 * @property string $apply_to
 * @property int|null $min_order_value
 * @property int|null $max_uses
 * @property int $uses_count
 * @property int|null $max_uses_per_customer
 * @property \Carbon\CarbonImmutable $starts_at
 * @property \Carbon\CarbonImmutable|null $ends_at
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property int $is_stackable
 * @property int $apply_to_discounted_products
 * @property int $is_auto_apply
 * @property int $priority
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DiscountCondition> $conditions
 * @property-read int|null $conditions_count
 * @method static \Database\Factories\DiscountFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereApplyTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereApplyToDiscountedProducts($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereEndsAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereIsAutoApply($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereIsStackable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereMaxUses($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereMaxUsesPerCustomer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereMinOrderValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereStartsAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereUsesCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereValue($value)
 * @mixin \Eloquent
 */
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
