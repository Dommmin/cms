<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Str;

it('creates a guest cart and returns cart token when no header provided', function () {
    $response = $this->getJson('/api/v1/cart');

    $response->assertSuccessful();
    $response->assertJsonStructure(['id', 'token', 'items']);
});

it('uses existing guest cart when X-Cart-Token header is provided', function () {
    $token = Str::uuid()->toString();

    $cart = Cart::query()->create(['session_token' => $token]);

    $response = $this->getJson('/api/v1/cart', ['X-Cart-Token' => $token]);

    $response->assertSuccessful();
    $response->assertJsonPath('id', $cart->id);
    $response->assertJsonPath('token', $token);
});

it('merges guest cart into customer cart on login with cart_token', function () {
    $token = Str::uuid()->toString();

    $productType = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true]
    );

    $category = Category::query()->firstOrCreate(
        ['slug' => 'test-category'],
        ['name' => 'Test Category', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => 'Test Product',
        'slug' => 'test-product-'.Str::random(6),
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'TEST-'.Str::random(6),
        'name' => 'Default',
        'price' => 1000,
        'stock_quantity' => 10,
    ]);

    $guestCart = Cart::query()->create(['session_token' => $token]);
    $guestCart->items()->create([
        'variant_id' => $variant->id,
        'quantity' => 2,
    ]);

    $user = User::factory()->create();

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'password',
        'cart_token' => $token,
    ]);

    $response->assertSuccessful();
    $response->assertJsonStructure(['token', 'user']);

    // Guest cart should be deleted after merge
    expect(Cart::query()->where('session_token', $token)->exists())->toBeFalse();

    // Customer cart should contain the item
    $customer = Customer::query()->where('user_id', $user->id)->first();
    expect($customer)->not->toBeNull();

    $customerCart = $customer->cart;
    expect($customerCart)->not->toBeNull();
    expect($customerCart->items()->where('variant_id', $variant->id)->exists())->toBeTrue();
});

it('login succeeds without cart_token and no cart is merged', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSuccessful();
    $response->assertJsonStructure(['token', 'user']);
});
