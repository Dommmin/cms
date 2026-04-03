<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ShippingCarrierEnum;
use App\Models\ShippingMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShippingMethod>
 */
class ShippingMethodFactory extends Factory
{
    protected $model = ShippingMethod::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'carrier' => ShippingCarrierEnum::PICKUP->value,
            'name' => ['en' => 'Pickup'],
            'description' => ['en' => 'Local pickup'],
            'is_active' => true,
            'base_price' => 0,
            'price_per_kg' => 0,
            'min_weight' => null,
            'max_weight' => 30.00,
            'min_order_value' => null,
            'free_shipping_threshold' => null,
            'estimated_days_min' => 0,
            'estimated_days_max' => 0,
        ];
    }
}
