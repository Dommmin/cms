<?php

declare(strict_types=1);

use App\Models\AnalyticsEvent;
use App\Models\Product;
use App\Models\ProductVariant;

describe('Analytics Event Ingestion API', function (): void {
    it('records a valid analytics event successfully', function (): void {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id]);

        $payload = [
            'session_id' => 'test-session-uuid-12345',
            'event_name' => 'view_item',
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'url' => 'https://example.com/products/test-product',
            'referrer' => 'https://google.com',
            'metadata' => [
                'price' => 2999,
                'currency' => 'PLN',
            ],
        ];

        $this->postJson('/api/v1/analytics/events', $payload)
            ->assertCreated()
            ->assertJsonPath('message', 'Event recorded.');

        $this->assertDatabaseHas('analytics_events', [
            'session_id' => 'test-session-uuid-12345',
            'event_name' => 'view_item',
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'url' => 'https://example.com/products/test-product',
            'referrer' => 'https://google.com',
        ]);
    });

    it('validates required fields', function (): void {
        $this->postJson('/api/v1/analytics/events', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['session_id', 'event_name']);
    });

    it('rejects invalid event names', function (): void {
        $this->postJson('/api/v1/analytics/events', [
            'session_id' => 'session-123',
            'event_name' => 'clicked_random_button',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['event_name']);
    });
});
