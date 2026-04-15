<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ShippingCarrierEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
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

    public array $translatable = ['name', 'description'];

    protected $casts = [
        'carrier' => ShippingCarrierEnum::class,
        'is_active' => 'boolean',
        'requires_signature' => 'boolean',
        'insurance_available' => 'boolean',
    ];

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
            return 0;
        }

        $cost = $this->base_price + (int) round($weightKg * $this->price_per_kg);

        return max(0, $cost);
    }

    /** Czy metoda wymaga wyboru punktu odbioru (paczkomat)? */
    public function requiresPickupPoint(): bool
    {
        return $this->carrier instanceof ShippingCarrierEnum && $this->carrier->requiresPickupPoint();
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
