<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ShippingCarrierEnum;
use Carbon\CarbonImmutable;
use Database\Factories\ShippingMethodFactory;
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
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property string $name
 * @property float $base_price
 * @property bool $is_active
 * @property float|null $max_length_cm
 * @property float|null $max_width_cm
 * @property float|null $max_depth_cm
 * @property Collection $restrictedProducts
 * @property Collection $restrictedCategories
 * @property ShippingCarrierEnum $carrier
 * @property array<array-key, mixed>|null $description
 * @property numeric|null $min_weight
 * @property numeric $max_weight
 * @property bool $requires_signature
 * @property bool $insurance_available
 * @property int|null $min_order_value
 * @property int|null $free_shipping_threshold
 * @property int $price_per_kg
 * @property int|null $estimated_days_min
 * @property int|null $estimated_days_max
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read array $translatable_columns_from
 * @property-read int|null $restricted_categories_count
 * @property-read int|null $restricted_products_count
 * @property-read Collection<int, Shipment> $shipments
 * @property-read int|null $shipments_count
 * @property-read mixed $translations
 *
 * @method static ShippingMethodFactory factory($count = null, $state = [])
 * @method static Builder<static>|ShippingMethod newModelQuery()
 * @method static Builder<static>|ShippingMethod newQuery()
 * @method static Builder<static>|ShippingMethod query()
 * @method static Builder<static>|ShippingMethod whereBasePrice($value)
 * @method static Builder<static>|ShippingMethod whereCarrier($value)
 * @method static Builder<static>|ShippingMethod whereCreatedAt($value)
 * @method static Builder<static>|ShippingMethod whereDescription($value)
 * @method static Builder<static>|ShippingMethod whereEstimatedDaysMax($value)
 * @method static Builder<static>|ShippingMethod whereEstimatedDaysMin($value)
 * @method static Builder<static>|ShippingMethod whereFreeShippingThreshold($value)
 * @method static Builder<static>|ShippingMethod whereId($value)
 * @method static Builder<static>|ShippingMethod whereInsuranceAvailable($value)
 * @method static Builder<static>|ShippingMethod whereIsActive($value)
 * @method static Builder<static>|ShippingMethod whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|ShippingMethod whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|ShippingMethod whereLocale(string $column, string $locale)
 * @method static Builder<static>|ShippingMethod whereLocales(string $column, array $locales)
 * @method static Builder<static>|ShippingMethod whereMaxDepthCm($value)
 * @method static Builder<static>|ShippingMethod whereMaxLengthCm($value)
 * @method static Builder<static>|ShippingMethod whereMaxWeight($value)
 * @method static Builder<static>|ShippingMethod whereMaxWidthCm($value)
 * @method static Builder<static>|ShippingMethod whereMinOrderValue($value)
 * @method static Builder<static>|ShippingMethod whereMinWeight($value)
 * @method static Builder<static>|ShippingMethod whereName($value)
 * @method static Builder<static>|ShippingMethod wherePricePerKg($value)
 * @method static Builder<static>|ShippingMethod whereRequiresSignature($value)
 * @method static Builder<static>|ShippingMethod whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'carrier', 'name', 'description', 'is_active', 'min_weight', 'max_weight',
    'min_order_value', 'free_shipping_threshold', 'base_price', 'price_per_kg',
    'estimated_days_min', 'estimated_days_max',
    'max_length_cm', 'max_width_cm', 'max_depth_cm',
    'requires_signature', 'insurance_available',
])]
#[Table(name: 'shipping_methods')]
class ShippingMethod extends Model
{
    use HasFactory;
    use HasTranslations;
    use LogsActivity;

    public array $translatable = ['name', 'description'];

    protected $casts = [
        'carrier' => ShippingCarrierEnum::class,
        'is_active' => 'boolean',
        'requires_signature' => 'boolean',
        'insurance_available' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'base_price', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('shipping_method');
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    public function restrictedProducts(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'shipping_method_restrictions',
            'shipping_method_id',
            'restrictable_id',
        )->wherePivot('restrictable_type', 'product');
    }

    public function restrictedCategories(): BelongsToMany
    {
        return $this->belongsToMany(
            Category::class,
            'shipping_method_restrictions',
            'shipping_method_id',
            'restrictable_id',
        )->wherePivot('restrictable_type', 'category');
    }

    public function isRestrictedFor(array $productIds, array $categoryIds): bool
    {
        if ($productIds === [] && $categoryIds === []) {
            return false;
        }

        $loadedProducts = $this->relationLoaded('restrictedProducts')
            ? $this->restrictedProducts
            : $this->restrictedProducts()->get();

        if ($productIds !== [] && $loadedProducts->whereIn('id', $productIds)->isNotEmpty()) {
            return true;
        }

        $loadedCategories = $this->relationLoaded('restrictedCategories')
            ? $this->restrictedCategories
            : $this->restrictedCategories()->get();

        return $categoryIds !== [] && $loadedCategories->whereIn('id', $categoryIds)->isNotEmpty();
    }

    /** Oblicza koszt shipping dla danej wagi i wartości zamówienia (grosze) */
    public function calculateCost(float $weightKg, int $orderValueCents): int
    {
        // Free shipping jeśli wartość zamówienia przekracza próg
        if ($this->free_shipping_threshold && $orderValueCents >= $this->free_shipping_threshold) {
            $cost = 0;
        } else {
            $cost = $this->base_price + (int) round($weightKg * $this->price_per_kg);
            $cost = max(0, $cost);
        }

        $filter = \App\Services\Hooks\Facades\Hook::filter(new \App\Services\Hooks\Shipping\ShippingCostFilter($cost, $this, $weightKg, $orderValueCents));

        return $filter->cost;
    }

    /** Czy metoda wymaga wyboru punktu odbioru (paczkomat)? */
    public function requiresPickupPoint(): bool
    {
        return $this->carrier->requiresPickupPoint();
    }

    public function hasMaxDimensions(): bool
    {
        return $this->max_length_cm !== null
            || $this->max_width_cm !== null
            || $this->max_depth_cm !== null;
    }

    /** Czy metoda jest dostępna dla tej wagi? */
    public function isAvailableForWeight(float $weightKg): bool
    {
        if ($this->min_weight && $weightKg < $this->min_weight) {
            return false;
        }

        return $weightKg <= $this->max_weight;
    }
}
