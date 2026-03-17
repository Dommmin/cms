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
                'name' => ['en' => 'In-store Pickup', 'pl' => 'Odbiór osobisty'],
                'description' => ['en' => 'Collect your order in person at our store. Payment on pickup.', 'pl' => 'Odbierz zamówienie osobiście w naszym sklepie. Płatność przy odbiorze.'],
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
                'name' => ['en' => 'DPD Courier', 'pl' => 'Kurier DPD'],
                'description' => ['en' => 'Delivery by DPD courier within 2–3 business days.', 'pl' => 'Dostawa kurierem DPD w ciągu 2–3 dni roboczych.'],
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
                'carrier' => ShippingCarrierEnum::DPD_PICKUP,
                'name' => ['en' => 'DPD Pickup Point', 'pl' => 'DPD Punkt Odbioru'],
                'description' => ['en' => 'Collect at your nearest DPD Pickup point. Delivery within 2–3 business days.', 'pl' => 'Odbierz w najbliższym punkcie DPD. Dostawa w ciągu 2–3 dni roboczych.'],
                'is_active' => true,
                'base_price' => 1099,
                'price_per_kg' => 0,
                'min_weight' => null,
                'max_weight' => 31.5,
                'min_order_value' => null,
                'free_shipping_threshold' => 15000,
                'estimated_days_min' => 2,
                'estimated_days_max' => 3,
            ],
            [
                'carrier' => ShippingCarrierEnum::DHL,
                'name' => ['en' => 'DHL Parcel', 'pl' => 'Paczka DHL'],
                'description' => ['en' => 'Fast delivery by DHL courier within 1–2 business days.', 'pl' => 'Szybka dostawa kurierem DHL w ciągu 1–2 dni roboczych.'],
                'is_active' => true,
                'base_price' => 1699,
                'price_per_kg' => 120,
                'min_weight' => null,
                'max_weight' => 30.0,
                'min_order_value' => null,
                'free_shipping_threshold' => 15000,
                'estimated_days_min' => 1,
                'estimated_days_max' => 2,
            ],
            [
                'carrier' => ShippingCarrierEnum::DHL_SERVICEPOINT,
                'name' => ['en' => 'DHL ServicePoint', 'pl' => 'DHL ServicePoint'],
                'description' => ['en' => 'Collect at your nearest DHL ServicePoint. Delivery within 1–2 business days.', 'pl' => 'Odbierz w najbliższym DHL ServicePoint. Dostawa w ciągu 1–2 dni roboczych.'],
                'is_active' => true,
                'base_price' => 1199,
                'price_per_kg' => 0,
                'min_weight' => null,
                'max_weight' => 30.0,
                'min_order_value' => null,
                'free_shipping_threshold' => 15000,
                'estimated_days_min' => 1,
                'estimated_days_max' => 2,
            ],
            [
                'carrier' => ShippingCarrierEnum::GLS,
                'name' => ['en' => 'GLS Parcel', 'pl' => 'Paczka GLS'],
                'description' => ['en' => 'Reliable GLS courier delivery within 2–3 business days.', 'pl' => 'Niezawodna dostawa kurierem GLS w ciągu 2–3 dni roboczych.'],
                'is_active' => true,
                'base_price' => 1399,
                'price_per_kg' => 90,
                'min_weight' => null,
                'max_weight' => 30.0,
                'min_order_value' => null,
                'free_shipping_threshold' => 15000,
                'estimated_days_min' => 2,
                'estimated_days_max' => 3,
            ],
            [
                'carrier' => ShippingCarrierEnum::INPOST,
                'name' => ['en' => 'InPost Courier', 'pl' => 'Kurier InPost'],
                'description' => ['en' => 'Home delivery by InPost courier within 1–2 business days.', 'pl' => 'Dostawa do domu kurierem InPost w ciągu 1–2 dni roboczych.'],
                'is_active' => true,
                'base_price' => 1299,
                'price_per_kg' => 80,
                'min_weight' => null,
                'max_weight' => 30.0,
                'min_order_value' => null,
                'free_shipping_threshold' => 15000,
                'estimated_days_min' => 1,
                'estimated_days_max' => 2,
            ],
            [
                'carrier' => ShippingCarrierEnum::INPOST_LOCKER,
                'name' => ['en' => 'InPost Parcel Locker', 'pl' => 'Paczkomat InPost'],
                'description' => ['en' => 'Pickup from an InPost parcel locker. Delivery within 1–2 business days.', 'pl' => 'Odbiór z paczkomatu InPost. Dostawa w ciągu 1–2 dni roboczych.'],
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
