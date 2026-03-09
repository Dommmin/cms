<?php

declare(strict_types=1);

use App\Models\Discount;
use App\Models\Product;
use App\Models\Promotion;
use App\Services\PromotionService;

$service = fn () => new PromotionService;

test('calculate cart discounts with no promotions', function () use ($service) {
    $product = Product::factory()->create();
    $cartItems = [
        ['product_id' => $product->id, 'quantity' => 2, 'price' => 100],
    ];

    $result = $service()->calculateCartDiscounts($cartItems);

    expect($result['total_discount'])->toEqual(0)
        ->and($result['applied_promotions'])->toBeEmpty()
        ->and($result['items'][0]['total_discount'])->toEqual(0);
});

test('calculate cart discounts with percentage promotion', function () use ($service) {
    $product = Product::factory()->create();
    $promotion = Promotion::factory()->create([
        'type' => 'percentage',
        'value' => 20,
        'apply_to' => 'all',
        'is_active' => true,
        'starts_at' => now()->subDay(),
        'ends_at' => null,
        'min_value' => null,
        'max_discount' => null,
    ]);

    $cartItems = [
        ['product_id' => $product->id, 'quantity' => 2, 'price' => 100],
    ];

    $result = $service()->calculateCartDiscounts($cartItems);

    expect($result['total_discount'])->toBe(40.0)
        ->and($result['applied_promotions'])->toHaveCount(1)
        ->and($result['applied_promotions'][0]['id'])->toBe($promotion->id)
        ->and($result['items'][0]['final_total'])->toBe(160.0);
});

test('calculate cart discounts with fixed amount promotion', function () use ($service) {
    $product = Product::factory()->create();
    Promotion::factory()->create([
        'type' => 'fixed_amount',
        'value' => 15,
        'apply_to' => 'all',
        'is_active' => true,
        'starts_at' => now()->subDay(),
        'ends_at' => null,
        'min_value' => null,
        'max_discount' => null,
    ]);

    $cartItems = [
        ['product_id' => $product->id, 'quantity' => 1, 'price' => 100],
    ];

    $result = $service()->calculateCartDiscounts($cartItems);

    expect($result['total_discount'])->toEqual(15)
        ->and($result['items'][0]['final_total'])->toEqual(85);
});

test('calculate cart discounts with buy x get y promotion', function () use ($service) {
    $product = Product::factory()->create();
    Promotion::factory()->create([
        'type' => 'buy_x_get_y',
        'metadata' => [
            'buy_quantity' => 2,
            'get_quantity' => 1,
            'discount_percentage' => 100,
        ],
        'apply_to' => 'all',
        'is_active' => true,
        'starts_at' => now()->subDay(),
        'ends_at' => null,
        'value' => null,
        'min_value' => null,
        'max_discount' => null,
    ]);

    $cartItems = [
        ['product_id' => $product->id, 'quantity' => 3, 'price' => 100],
    ];

    $result = $service()->calculateCartDiscounts($cartItems);

    // Buy 2 get 1 free = 1 free product (100 zł discount)
    expect($result['total_discount'])->toBe(100.0)
        ->and($result['items'][0]['final_total'])->toBe(200.0);
});

test('calculate cart discounts with specific product promotion', function () use ($service) {
    $product1 = Product::factory()->create();
    $product2 = Product::factory()->create();

    $promotion = Promotion::factory()->create([
        'type' => 'percentage',
        'value' => 20,
        'apply_to' => 'specific_products',
        'is_active' => true,
        'starts_at' => now()->subDay(),
        'ends_at' => null,
        'min_value' => null,
        'max_discount' => null,
    ]);

    $promotion->products()->attach($product1->id);

    $cartItems = [
        ['product_id' => $product1->id, 'quantity' => 1, 'price' => 100],
        ['product_id' => $product2->id, 'quantity' => 1, 'price' => 50],
    ];

    $result = $service()->calculateCartDiscounts($cartItems);

    // Only product1 gets 20% discount
    expect($result['total_discount'])->toBe(20.0)
        ->and($result['items'][0]['final_total'])->toBe(80.0) // 100 - 20
        ->and($result['items'][1]['final_total'])->toEqual(50); // No discount
});

test('apply discount code valid', function () use ($service) {
    Discount::factory()->create([
        'code' => 'TEST20',
        'type' => 'percentage',
        'value' => 20,
        'is_active' => true,
    ]);

    $cartItems = [
        ['product_id' => 1, 'quantity' => 1, 'price' => 100],
    ];

    $result = $service()->applyDiscountCode('TEST20', $cartItems);

    expect($result['success'])->toBeTrue()
        ->and($result['discount']['discount_amount'])->toEqual(20);
});

test('apply discount code invalid', function () use ($service) {
    $cartItems = [
        ['product_id' => 1, 'quantity' => 1, 'price' => 100],
    ];

    $result = $service()->applyDiscountCode('INVALID', $cartItems);

    expect($result['success'])->toBeFalse()
        ->and($result['message'])->toBe('Nieprawidłowy kod rabatowy');
});

test('get best promotion', function () use ($service) {
    $product = Product::factory()->create();

    Promotion::factory()->create([
        'type' => 'percentage',
        'value' => 10,
        'apply_to' => 'all',
        'is_active' => true,
        'starts_at' => now()->subDay(),
        'ends_at' => null,
        'min_value' => null,
        'max_discount' => null,
    ]);

    $highValuePromotion = Promotion::factory()->create([
        'type' => 'percentage',
        'value' => 25,
        'apply_to' => 'all',
        'is_active' => true,
        'starts_at' => now()->subDay(),
        'ends_at' => null,
        'min_value' => null,
        'max_discount' => null,
    ]);

    $bestPromotion = $service()->getBestPromotion($product, 1, 100);

    expect($bestPromotion?->id)->toBe($highValuePromotion->id);
});
