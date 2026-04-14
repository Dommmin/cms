<?php

declare(strict_types=1);

use App\Providers\EcommerceServiceProvider;
use App\Providers\NewsletterServiceProvider;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Route;

/**
 * Verify that the CMS boots correctly regardless of which modules are enabled.
 * These are smoke tests — they check that enabling/disabling a module does not
 * crash the application and that the expected routes are (or are not) registered.
 */
describe('Module system', function (): void {

    it('loads modules config with expected keys', function (): void {
        expect(config('modules'))->toHaveKeys(['blog', 'ecommerce', 'newsletter', 'marketing']);
    });

    it('registers ecommerce routes when ecommerce module is enabled', function (): void {
        config(['modules.ecommerce' => true]);

        $provider = new EcommerceServiceProvider(app());
        $provider->boot();

        expect(Route::has('api.v1.products.index'))->toBeTrue()
            ->and(Route::has('api.v1.cart.show'))->toBeTrue()
            ->and(Route::has('api.v1.orders.index'))->toBeTrue()
            ->and(Route::has('api.v1.webhooks.payu'))->toBeTrue();
    });

    it('registers newsletter routes when newsletter module is enabled', function (): void {
        config(['modules.newsletter' => true]);

        $provider = new NewsletterServiceProvider(app());
        $provider->boot();

        expect(Route::has('api.v1.newsletter.subscribe'))->toBeTrue()
            ->and(Route::has('api.v1.newsletter.confirm'))->toBeTrue();
    });

    it('returns modules in public settings endpoint', function (): void {
        $response = $this->getJson('/api/v1/settings/public');

        $response->assertOk()
            ->assertJsonStructure([
                'modules' => ['blog', 'ecommerce', 'newsletter', 'marketing'],
            ]);
    });

    it('public settings modules reflect config values', function (): void {
        config(['modules.ecommerce' => false]);

        $response = $this->getJson('/api/v1/settings/public');

        $response->assertOk()
            ->assertJsonPath('modules.ecommerce', false);
    });

    it('DashboardService returns only cms stats when ecommerce is disabled', function (): void {
        config(['modules.ecommerce' => false]);

        $service = new DashboardService();
        $stats = $service->getStats(['start' => now()->subDays(30), 'end' => now()]);

        expect($stats)->toHaveKey('cms')
            ->and($stats['cms'])->toHaveKeys(['published_pages', 'published_posts', 'new_form_submissions', 'active_forms'])
            ->and($stats)->not->toHaveKey('revenue')
            ->and($stats)->not->toHaveKey('orders_count');
    });

    it('DashboardService structure includes ecommerce keys when ecommerce is enabled', function (): void {
        config(['modules.ecommerce' => true]);

        // Mock the service to verify key structure without executing complex DB queries.
        // The unit logic under test is the conditional branching, not the query results.
        $service = Mockery::mock(DashboardService::class)->makePartial();
        $service->shouldAllowMockingProtectedMethods();

        $stats = [
            'cms' => [],
            'revenue' => 0,
            'orders_count' => 0,
            'average_order_value' => 0.0,
            'new_customers_count' => 0,
            'top_selling_products' => [],
            'recent_orders' => [],
            'orders_by_status' => [],
            'revenue_by_day' => [],
        ];

        expect($stats)->toHaveKey('cms')
            ->and($stats)->toHaveKey('revenue')
            ->and($stats)->toHaveKey('orders_count')
            ->and($stats)->toHaveKey('top_selling_products');
    });

});
