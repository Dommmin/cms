<?php

declare(strict_types=1);

use App\Models\AnalyticsEvent;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
});

describe('Admin Analytics Reports', function (): void {
    it('returns the conversion dashboard with complete funnel, landing pages, and promo attribution stats', function (): void {
        // Create sessions
        // Session 1: completed funnel with promo
        $session1 = 'session-completed-1';
        AnalyticsEvent::query()->create([
            'session_id' => $session1,
            'event_name' => 'impression',
            'url' => 'https://example.com/products/apple',
            'referrer' => 'https://google.com',
            'created_at' => now(),
        ]);
        AnalyticsEvent::query()->create([
            'session_id' => $session1,
            'event_name' => 'view_item',
            'url' => 'https://example.com/products/apple',
            'created_at' => now(),
        ]);
        AnalyticsEvent::query()->create([
            'session_id' => $session1,
            'event_name' => 'add_to_cart',
            'url' => 'https://example.com/products/apple',
            'created_at' => now(),
        ]);
        AnalyticsEvent::query()->create([
            'session_id' => $session1,
            'event_name' => 'begin_checkout',
            'url' => 'https://example.com/checkout',
            'created_at' => now(),
        ]);
        AnalyticsEvent::query()->create([
            'session_id' => $session1,
            'event_name' => 'payment_step',
            'url' => 'https://example.com/checkout',
            'created_at' => now(),
        ]);
        AnalyticsEvent::query()->create([
            'session_id' => $session1,
            'event_name' => 'purchase',
            'url' => 'https://example.com/checkout/success',
            'metadata' => [
                'discount_code' => 'SUMMER50',
                'revenue' => 12000, // 120.00 PLN
            ],
            'created_at' => now(),
        ]);

        // Session 2: Dropped after view_item on another landing page
        $session2 = 'session-dropped-2';
        AnalyticsEvent::query()->create([
            'session_id' => $session2,
            'event_name' => 'impression',
            'url' => 'https://example.com/products/banana',
            'referrer' => 'https://facebook.com',
            'created_at' => now(),
        ]);
        AnalyticsEvent::query()->create([
            'session_id' => $session2,
            'event_name' => 'view_item',
            'url' => 'https://example.com/products/banana',
            'created_at' => now(),
        ]);

        // Access the conversion dashboard
        $response = $this->actingAs($this->user)
            ->get(route('admin.analytics.conversion'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/analytics/conversion')
            ->has('data.stages')
            ->has('data.landing_pages')
            ->has('data.promotions')
            ->where('data.stages.0.count', 2) // 2 impressions
            ->where('data.stages.1.count', 2) // 2 view_item
            ->where('data.stages.5.count', 1) // 1 purchase
            // Check landing pages
            ->where('data.landing_pages.0.url', '/products/apple')
            ->where('data.landing_pages.0.sessions', 1)
            ->where('data.landing_pages.0.conversions', 1)
            ->where('data.landing_pages.0.revenue', 12000)
            // Check promo code attribution
            ->where('data.promotions.0.code', 'SUMMER50')
            ->where('data.promotions.0.purchases', 1)
            ->where('data.promotions.0.revenue', 12000)
        );
    });
});
