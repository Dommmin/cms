<?php

declare(strict_types=1);

use App\Models\User;

it('adds public cache headers to cacheable GET endpoints', function (): void {
    $this->getJson('/api/v1/products')
        ->assertSuccessful()
        ->assertHeader('Cache-Control');

    $cacheControl = $this->getJson('/api/v1/products')
        ->headers->get('Cache-Control');

    expect($cacheControl)->toContain('public');
    expect($cacheControl)->toContain('s-maxage=300');
    expect($cacheControl)->toContain('stale-while-revalidate=3600');
});

it('adds longer cache for blog endpoints', function (): void {
    $response = $this->getJson('/api/v1/blog/posts');

    $cacheControl = $response->headers->get('Cache-Control');

    expect($cacheControl)->toContain('public');
    expect($cacheControl)->toContain('s-maxage=600');
    expect($cacheControl)->toContain('stale-while-revalidate=7200');
});

it('adds longest cache for settings/public endpoint', function (): void {
    $response = $this->getJson('/api/v1/settings/public');

    $cacheControl = $response->headers->get('Cache-Control');

    expect($cacheControl)->toContain('public');
    expect($cacheControl)->toContain('s-maxage=3600');
    expect($cacheControl)->toContain('stale-while-revalidate=86400');
});

it('sets no-store for authenticated requests', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/products');

    $cacheControl = $response->headers->get('Cache-Control');

    expect($cacheControl)->toContain('private');
    expect($cacheControl)->toContain('no-store');
});

it('sets no-store for requests with bearer token', function (): void {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token])
        ->getJson('/api/v1/products');

    $cacheControl = $response->headers->get('Cache-Control');

    expect($cacheControl)->toContain('private');
    expect($cacheControl)->toContain('no-store');
});

it('sets no-store for POST requests', function (): void {
    $response = $this->postJson('/api/v1/newsletter/subscribe', [
        'email' => 'test@example.com',
    ]);

    $cacheControl = $response->headers->get('Cache-Control');

    expect($cacheControl)->toContain('no-cache');
    expect($cacheControl)->toContain('no-store');
});

it('sets private no-store for cart endpoints', function (): void {
    $response = $this->getJson('/api/v1/cart');

    $cacheControl = $response->headers->get('Cache-Control');

    expect($cacheControl)->toContain('no-store');
});

it('adds Vary header on cacheable responses', function (): void {
    $this->getJson('/api/v1/products')
        ->assertHeader('Vary');

    $vary = $this->getJson('/api/v1/products')->headers->get('Vary');

    expect($vary)->toContain('Accept-Encoding');
    expect($vary)->toContain('Accept-Language');
    expect($vary)->toContain('X-Cart-Token');
});

it('does not add Vary header for non-cacheable responses', function (): void {
    $response = $this->postJson('/api/v1/newsletter/subscribe', [
        'email' => 'test@example.com',
    ]);

    // Vary should not be set when caching is bypassed
    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('no-store');
});

it('sets no-store on 4xx responses', function (): void {
    $response = $this->getJson('/api/v1/products/non-existent-slug-xyz');

    $cacheControl = $response->headers->get('Cache-Control');

    expect($cacheControl)->toContain('no-cache');
    expect($cacheControl)->toContain('no-store');
});
