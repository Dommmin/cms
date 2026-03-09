<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ShippingCarrierEnum;
use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'carrier' => ShippingCarrierEnum::PICKUP,
                'name' => 'In-store Pickup',
                'description' => 'Collect your order in person at our store. Payment on pickup.',
                'is_active' => true,
                'base_price' => 0,
                'price_per_kg' => 0,
                'min_weight' => null,
                'max_weight' => 999.0,
                'min_order_value' => null,
                'free_shipping_threshold' => null,
                'estimated_days_min' => 1,
                'estimated_days_max' => 3,
            ],
            [
                'carrier' => ShippingCarrierEnum::DPD,
                'name' => 'DPD Courier',
                'description' => 'Delivery by DPD courier within 2–3 business days.',
                'is_active' => true,
                'base_price' => 1499,
                'price_per_kg' => 100,
                'min_weight' => null,
                'max_weight' => 30.0,
                'min_order_value' => null,
                'free_shipping_threshold' => 15000,
                'estimated_days_min' => 2,
                'estimated_days_max' => 3,
            ],
            [
                'carrier' => ShippingCarrierEnum::INPOST,
                'name' => 'InPost Parcel Locker',
                'description' => 'Pickup from an InPost parcel locker. Delivery within 1–2 business days.',
                'is_active' => true,
                'base_price' => 999,
                'price_per_kg' => 0,
                'min_weight' => null,
                'max_weight' => 25.0,
                'min_order_value' => null,
                'free_shipping_threshold' => 15000,
                'estimated_days_min' => 1,
                'estimated_days_max' => 2,
            ],
        ];

        foreach ($methods as $method) {
            ShippingMethod::query()->updateOrCreate(
                ['carrier' => $method['carrier']],
                $method
            );
        }
    }
}
