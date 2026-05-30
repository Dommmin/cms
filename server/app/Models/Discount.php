<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\DiscountFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
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
 * @property CarbonImmutable|null $starts_at
 * @property CarbonImmutable|null $ends_at
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property int $is_stackable
 * @property int $apply_to_discounted_products
 * @property int $is_auto_apply
 * @property int $priority
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, DiscountCondition> $conditions
 * @property-read int|null $conditions_count
 * @property-read Collection<int, Product> $products
 * @property-read Collection<int, Category> $categories
 *
 * @method static DiscountFactory factory($count = null, $state = [])
 * @method static Builder<static>|Discount newModelQuery()
 * @method static Builder<static>|Discount newQuery()
 * @method static Builder<static>|Discount query()
 * @method static Builder<static>|Discount whereApplyTo($value)
 * @method static Builder<static>|Discount whereApplyToDiscountedProducts($value)
 * @method static Builder<static>|Discount whereCode($value)
 * @method static Builder<static>|Discount whereCreatedAt($value)
 * @method static Builder<static>|Discount whereEndsAt($value)
 * @method static Builder<static>|Discount whereId($value)
 * @method static Builder<static>|Discount whereIsActive($value)
 * @method static Builder<static>|Discount whereIsAutoApply($value)
 * @method static Builder<static>|Discount whereIsStackable($value)
 * @method static Builder<static>|Discount whereMaxUses($value)
 * @method static Builder<static>|Discount whereMaxUsesPerCustomer($value)
 * @method static Builder<static>|Discount whereMinOrderValue($value)
 * @method static Builder<static>|Discount whereName($value)
 * @method static Builder<static>|Discount wherePriority($value)
 * @method static Builder<static>|Discount whereStartsAt($value)
 * @method static Builder<static>|Discount whereType($value)
 * @method static Builder<static>|Discount whereUpdatedAt($value)
 * @method static Builder<static>|Discount whereUsesCount($value)
 * @method static Builder<static>|Discount whereValue($value)
 *
 * @mixin Model
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

    /**
     * @return HasMany<DiscountCondition, $this>
     */
    public function conditions(): HasMany
    {
        return $this->hasMany(DiscountCondition::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'discount_products');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'discount_categories');
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
