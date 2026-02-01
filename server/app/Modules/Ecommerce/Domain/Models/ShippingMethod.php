<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Enums\ShippingCarrier;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class ShippingMethod extends Model
{
    protected $table = 'shipping_methods';

    protected $fillable = [
        'carrier', 'name', 'is_active', 'min_weight', 'max_weight',
        'min_order_value', 'free_shipping_threshold', 'base_price', 'price_per_kg',
    ];

    protected $casts = [
        'carrier'   => ShippingCarrier::class,
        'is_active' => 'boolean',
    ];

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
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

    /** Czy metoda jest dostępna dla tej wagi? */
    public function isAvailableForWeight(float $weightKg): bool
    {
        if ($this->min_weight && $weightKg < $this->min_weight) return false;
        if ($weightKg > $this->max_weight) return false;
        return true;
    }
}

