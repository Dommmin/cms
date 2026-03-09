<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        // ── Sale na całą kolekcję letnią ──────────────────────────────────────
        $summerSale = Promotion::query()->updateOrCreate(
            ['slug' => 'letnia-wyprzedaz-2026'],
            [
                'name' => 'Letnia Wyprzedaż 2026',
                'slug' => 'letnia-wyprzedaz-2026',
                'description' => 'Do -30% na całą kolekcję letnią. Tylko przez ograniczony czas!',
                'type' => 'percentage',
                'value' => 20,
                'min_value' => null,
                'max_discount' => null,
                'apply_to' => 'all',
                'is_active' => true,
                'is_stackable' => false,
                'priority' => 1,
                'starts_at' => now()->subDays(5),
                'ends_at' => now()->addDays(25),
                'metadata' => [
                    'badge_text' => 'SALE -20%',
                    'badge_color' => 'red',
                    'banner_title' => 'Letnia Wyprzedaż',
                    'banner_subtitle' => 'Do -20% na tysiące produktów',
                ],
            ],
        );

        // ── Promocja na odzież damską ─────────────────────────────────────────
        $womensSale = Promotion::query()->updateOrCreate(
            ['slug' => 'moda-damska-30-procent'],
            [
                'name' => 'Moda Damska -30%',
                'slug' => 'moda-damska-30-procent',
                'description' => 'Aż 30% zniżki na całą odzież damską.',
                'type' => 'percentage',
                'value' => 30,
                'min_value' => null,
                'max_discount' => 15000, // max 150 zł zniżki
                'apply_to' => 'specific_categories',
                'is_active' => true,
                'is_stackable' => false,
                'priority' => 2,
                'starts_at' => now()->subDays(3),
                'ends_at' => now()->addDays(12),
                'metadata' => [
                    'badge_text' => '-30%',
                    'badge_color' => 'pink',
                ],
            ],
        );

        // Podpnij do kategorii womens-clothing
        $womensCategory = Category::query()->where('slug', 'womens-clothing')->first();
        if ($womensCategory && ! $womensSale->categories()->where('categories.id', $womensCategory->id)->exists()) {
            $womensSale->categories()->attach($womensCategory->id, [
                'discount_value' => 30,
                'discount_type' => 'percentage',
            ]);
        }

        // ── Buy 2 get 3rd free (odzież) ───────────────────────────────────────
        Promotion::query()->updateOrCreate(
            ['slug' => '2-plus-1-gratis'],
            [
                'name' => '2+1 gratis na wybrane koszulki',
                'slug' => '2-plus-1-gratis',
                'description' => 'Kup 2 koszulki, trzecia 100% gratis.',
                'type' => 'buy_x_get_y',
                'value' => null,
                'min_value' => null,
                'max_discount' => null,
                'apply_to' => 'all',
                'is_active' => true,
                'is_stackable' => false,
                'priority' => 3,
                'starts_at' => null,
                'ends_at' => null,
                'metadata' => [
                    'buy_quantity' => 2,
                    'get_quantity' => 1,
                    'discount_percentage' => 100,
                    'badge_text' => '2+1',
                    'badge_color' => 'green',
                ],
            ],
        );

        // ── Darmowa dostawa od 199 zł ─────────────────────────────────────────
        Promotion::query()->updateOrCreate(
            ['slug' => 'darmowa-dostawa-199'],
            [
                'name' => 'Darmowa dostawa od 199 zł',
                'slug' => 'darmowa-dostawa-199',
                'description' => 'Zamów za minimum 199 zł i nic nie płacisz za dostawę.',
                'type' => 'free_shipping',
                'value' => null,
                'min_value' => 19900, // 199 zł
                'max_discount' => null,
                'apply_to' => 'all',
                'is_active' => true,
                'is_stackable' => true,
                'priority' => 10,
                'starts_at' => null,
                'ends_at' => null,
                'metadata' => [
                    'badge_text' => 'Darmowa dostawa',
                    'badge_color' => 'blue',
                    'min_order_label' => 'od 199 zł',
                ],
            ],
        );

        // ── Elektronika — fixed discount ──────────────────────────────────────
        $electronicsSale = Promotion::query()->updateOrCreate(
            ['slug' => 'elektronika-minus-50zl'],
            [
                'name' => 'Elektronika — rabat 50 zł',
                'slug' => 'elektronika-minus-50zl',
                'description' => 'Odbierz 50 zł zniżki na sprzęt elektroniczny przy zakupie od 300 zł.',
                'type' => 'fixed_amount',
                'value' => 5000, // 50 zł
                'min_value' => 30000, // 300 zł min
                'max_discount' => 5000,
                'apply_to' => 'specific_categories',
                'is_active' => true,
                'is_stackable' => false,
                'priority' => 4,
                'starts_at' => null,
                'ends_at' => now()->addDays(30),
                'metadata' => [
                    'badge_text' => '-50 ZŁ',
                    'badge_color' => 'purple',
                ],
            ],
        );

        $electronicsCategory = Category::query()->where('slug', 'electronics')->first();
        if ($electronicsCategory && ! $electronicsSale->categories()->where('categories.id', $electronicsCategory->id)->exists()) {
            $electronicsSale->categories()->attach($electronicsCategory->id, [
                'discount_value' => 50,
                'discount_type' => 'fixed',
            ]);
        }

        // ── Black Friday (nieaktywna — dla prezentacji historii) ───────────────
        Promotion::query()->updateOrCreate(
            ['slug' => 'black-friday-2025'],
            [
                'name' => 'Black Friday 2025 — do -50%',
                'slug' => 'black-friday-2025',
                'description' => 'Największe promocje roku. Tysiące produktów w obniżonych cenach.',
                'type' => 'percentage',
                'value' => 50,
                'min_value' => null,
                'max_discount' => 30000, // max 300 zł
                'apply_to' => 'all',
                'is_active' => false,
                'is_stackable' => false,
                'priority' => 0,
                'starts_at' => now()->subMonths(4),
                'ends_at' => now()->subMonths(4)->addDays(3),
                'metadata' => [
                    'badge_text' => 'BLACK FRIDAY',
                    'badge_color' => 'black',
                    'banner_title' => 'Black Friday',
                    'banner_subtitle' => 'Do -50% na wszystko',
                ],
            ],
        );

        // ── Nowi klienci — procent od pierwszego zamówienia ───────────────────
        Promotion::query()->updateOrCreate(
            ['slug' => 'pierwsze-zakupy-15'],
            [
                'name' => 'Pierwsze zakupy -15%',
                'slug' => 'pierwsze-zakupy-15',
                'description' => 'Specjalna oferta dla nowych klientów — 15% na pierwsze zamówienie.',
                'type' => 'percentage',
                'value' => 15,
                'min_value' => null,
                'max_discount' => 5000, // max 50 zł
                'apply_to' => 'all',
                'is_active' => true,
                'is_stackable' => false,
                'priority' => 5,
                'starts_at' => null,
                'ends_at' => null,
                'metadata' => [
                    'badge_text' => 'NOWOŚĆ -15%',
                    'badge_color' => 'orange',
                    'new_customers_only' => true,
                ],
            ],
        );
    }
}
