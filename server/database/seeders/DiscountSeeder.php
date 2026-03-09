<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Discount;
use Illuminate\Database\Seeder;

class DiscountSeeder extends Seeder
{
    public function run(): void
    {
        $always = now()->subYears(5);

        $discounts = [
            // ── Welcome / one-time use ─────────────────────────────────────────
            [
                'code' => 'WELCOME10',
                'name' => 'Powitalne 10% dla nowych klientów',
                'type' => 'percentage',
                'value' => 10,
                'apply_to' => 'all',
                'min_order_value' => 0,
                'max_uses' => null,
                'max_uses_per_customer' => 1,
                'starts_at' => $always,
                'ends_at' => null,
                'is_active' => true,
            ],

            // ── Seasonal ───────────────────────────────────────────────────────
            [
                'code' => 'SUMMER20',
                'name' => 'Letnia wyprzedaż 20%',
                'type' => 'percentage',
                'value' => 20,
                'apply_to' => 'all',
                'min_order_value' => 5000, // 50 zł
                'max_uses' => 500,
                'max_uses_per_customer' => 2,
                'starts_at' => now()->subDays(10),
                'ends_at' => now()->addDays(20),
                'is_active' => true,
            ],
            [
                'code' => 'BLACKFRIDAY',
                'name' => 'Black Friday 30%',
                'type' => 'percentage',
                'value' => 30,
                'apply_to' => 'all',
                'min_order_value' => 10000, // 100 zł
                'max_uses' => 1000,
                'max_uses_per_customer' => 1,
                'starts_at' => now()->subDays(365),
                'ends_at' => now()->subDays(330),
                'is_active' => false, // przeszły
            ],

            // ── Fixed amount ───────────────────────────────────────────────────
            [
                'code' => 'SAVE50',
                'name' => 'Zniżka 50 zł przy zakupie od 200 zł',
                'type' => 'fixed_amount',
                'value' => 5000,
                'apply_to' => 'all',
                'min_order_value' => 20000, // 200 zł
                'max_uses' => null,
                'max_uses_per_customer' => null,
                'starts_at' => $always,
                'ends_at' => null,
                'is_active' => true,
            ],
            [
                'code' => 'SAVE100',
                'name' => 'Zniżka 100 zł przy zakupie od 400 zł',
                'type' => 'fixed_amount',
                'value' => 10000,
                'apply_to' => 'all',
                'min_order_value' => 40000, // 400 zł
                'max_uses' => null,
                'max_uses_per_customer' => null,
                'starts_at' => $always,
                'ends_at' => null,
                'is_active' => true,
            ],

            // ── Free shipping ──────────────────────────────────────────────────
            [
                'code' => 'FREESHIP',
                'name' => 'Darmowa dostawa bez minimum',
                'type' => 'free_shipping',
                'value' => 0,
                'apply_to' => 'all',
                'min_order_value' => 0,
                'max_uses' => 200,
                'max_uses_per_customer' => 1,
                'starts_at' => $always,
                'ends_at' => now()->addDays(14),
                'is_active' => true,
            ],

            // ── Newsletter / loyalty ───────────────────────────────────────────
            [
                'code' => 'NEWSLETTER15',
                'name' => '15% za zapis do newslettera',
                'type' => 'percentage',
                'value' => 15,
                'apply_to' => 'all',
                'min_order_value' => 0,
                'max_uses' => null,
                'max_uses_per_customer' => 1,
                'starts_at' => $always,
                'ends_at' => null,
                'is_active' => true,
            ],

            // ── Flash sale (wygasły — przykład historii) ───────────────────────
            [
                'code' => 'FLASH25',
                'name' => 'Flash sale 25% — 24h',
                'type' => 'percentage',
                'value' => 25,
                'apply_to' => 'all',
                'min_order_value' => 0,
                'max_uses' => 100,
                'max_uses_per_customer' => 1,
                'starts_at' => now()->subDays(5),
                'ends_at' => now()->subDays(4),
                'is_active' => false,
            ],

            // ── VIP / high-value ───────────────────────────────────────────────
            [
                'code' => 'VIP20',
                'name' => 'Kod VIP — 20% bez limitu',
                'type' => 'percentage',
                'value' => 20,
                'apply_to' => 'all',
                'min_order_value' => 0,
                'max_uses' => null,
                'max_uses_per_customer' => null,
                'starts_at' => $always,
                'ends_at' => null,
                'is_active' => true,
            ],
        ];

        foreach ($discounts as $data) {
            Discount::query()->updateOrCreate(
                ['code' => $data['code']],
                $data,
            );
        }
    }
}
