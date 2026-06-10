<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnalyticsEvent;
use App\Models\Product;
use App\Models\SearchLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AnalyticsEventSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::query()->get();
        if ($products->isEmpty()) {
            return;
        }

        $landingUrls = [
            'http://localhost:3000/',
            'http://localhost:3000/products',
            'http://localhost:3000/categories/electronics',
            'http://localhost:3000/blog/how-to-choose-laptop',
        ];

        $referrers = [
            'https://google.com',
            'https://facebook.com',
            'https://t.co',
            '',
        ];

        // Seed 150 sessions over the last 30 days
        for ($i = 0; $i < 150; $i++) {
            $sessionId = Str::uuid()->toString();
            $date = now()->subDays(random_int(0, 29))->subHours(random_int(0, 23))->subMinutes(random_int(0, 59));

            $landingUrl = $landingUrls[array_rand($landingUrls)];
            $referrer = $referrers[array_rand($referrers)];

            // Step 1: Impression (100% of sessions)
            $product = $products->random();
            AnalyticsEvent::query()->create([
                'session_id' => $sessionId,
                'event_name' => 'impression',
                'product_id' => $product->id,
                'url' => $landingUrl,
                'referrer' => $referrer,
                'created_at' => $date,
            ]);

            // Step 2: View Item (80% chance)
            if (random_int(1, 100) > 80) {
                continue;
            }

            $productUrl = 'http://localhost:3000/products/'.$product->slug;
            $date = $date->copy()->addMinutes(random_int(1, 5));
            AnalyticsEvent::query()->create([
                'session_id' => $sessionId,
                'event_name' => 'view_item',
                'product_id' => $product->id,
                'url' => $productUrl,
                'referrer' => $landingUrl,
                'metadata' => [
                    'name' => $product->getTranslation('name', 'en', false),
                    'price' => $product->priceRange()['min'],
                ],
                'created_at' => $date,
            ]);

            // Step 3: Add to Cart (50% chance)
            if (random_int(1, 100) > 50) {
                continue;
            }

            $date = $date->copy()->addMinutes(random_int(1, 3));
            AnalyticsEvent::query()->create([
                'session_id' => $sessionId,
                'event_name' => 'add_to_cart',
                'product_id' => $product->id,
                'product_variant_id' => $product->variants->first()?->id,
                'url' => $productUrl,
                'referrer' => $productUrl,
                'metadata' => [
                    'name' => $product->getTranslation('name', 'en', false),
                    'price' => $product->priceRange()['min'],
                    'quantity' => 1,
                ],
                'created_at' => $date,
            ]);

            // Step 4: Begin Checkout (60% chance)
            if (random_int(1, 100) > 60) {
                continue;
            }

            $checkoutUrl = 'http://localhost:3000/checkout';
            $date = $date->copy()->addMinutes(random_int(1, 3));
            AnalyticsEvent::query()->create([
                'session_id' => $sessionId,
                'event_name' => 'begin_checkout',
                'url' => $checkoutUrl,
                'referrer' => $productUrl,
                'metadata' => [
                    'value' => $product->priceRange()['min'],
                    'currency' => 'PLN',
                ],
                'created_at' => $date,
            ]);

            // Step 5: Payment Step (80% chance)
            if (random_int(1, 100) > 80) {
                continue;
            }

            $date = $date->copy()->addMinutes(random_int(1, 2));
            AnalyticsEvent::query()->create([
                'session_id' => $sessionId,
                'event_name' => 'payment_step',
                'url' => $checkoutUrl,
                'referrer' => $checkoutUrl,
                'metadata' => [
                    'value' => $product->priceRange()['min'],
                    'currency' => 'PLN',
                    'payment_type' => 'card',
                ],
                'created_at' => $date,
            ]);

            // Step 6: Purchase (75% chance)
            if (random_int(1, 100) > 75) {
                continue;
            }

            $date = $date->copy()->addMinutes(random_int(1, 2));
            $usePromo = random_int(1, 100) > 50;
            $promoCode = $usePromo ? ['SAVE10', 'WELCOME5', 'FREE2026'][random_int(0, 2)] : null;
            $revenue = $product->priceRange()['min'];
            if ($promoCode === 'SAVE10') {
                $revenue = (int) ($revenue * 0.9);
            }

            if ($promoCode === 'WELCOME5') {
                $revenue = max(0, $revenue - 500);
            }

            AnalyticsEvent::query()->create([
                'session_id' => $sessionId,
                'event_name' => 'purchase',
                'url' => 'http://localhost:3000/checkout/success',
                'referrer' => $checkoutUrl,
                'metadata' => [
                    'transaction_id' => 'ORD-'.mb_strtoupper(Str::random(8)),
                    'revenue' => $revenue,
                    'currency' => 'PLN',
                    'discount_code' => $promoCode,
                ],
                'created_at' => $date,
            ]);
        }

        // Seed some zero-result search logs
        $queries = ['iphone 17', 'playstation 6', 'nikon camera', 'wool sweater', 'electric scooter'];
        foreach ($queries as $q) {
            for ($k = 0; $k < random_int(3, 12); $k++) {
                SearchLog::query()->create([
                    'query' => $q,
                    'results_count' => 0,
                    'is_autocomplete' => false,
                    'created_at' => now()->subDays(random_int(1, 20)),
                ]);
            }
        }
    }
}
