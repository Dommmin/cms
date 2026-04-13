<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
});

// ── Model: isRestrictedFor ────────────────────────────────────────────────────

it('returns false when no restrictions exist', function (): void {
    $method = ShippingMethod::factory()->create();

    expect($method->isRestrictedFor([1, 2], [3]))->toBeFalse();
});

it('returns false when product and category lists are empty', function (): void {
    $method = ShippingMethod::factory()->create();
    $product = Product::factory()->create();

    DB::table('shipping_method_restrictions')->insert([
        'shipping_method_id' => $method->id,
        'restrictable_type' => 'product',
        'restrictable_id' => $product->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $method->load('restrictedProducts', 'restrictedCategories');

    expect($method->isRestrictedFor([], []))->toBeFalse();
});

it('returns true when a restricted product is in the list', function (): void {
    $method = ShippingMethod::factory()->create();
    $product = Product::factory()->create();

    DB::table('shipping_method_restrictions')->insert([
        'shipping_method_id' => $method->id,
        'restrictable_type' => 'product',
        'restrictable_id' => $product->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $method->load('restrictedProducts', 'restrictedCategories');

    expect($method->isRestrictedFor([$product->id], []))->toBeTrue();
});

it('returns true when a restricted category is in the list', function (): void {
    $method = ShippingMethod::factory()->create();
    $category = Category::factory()->create();

    DB::table('shipping_method_restrictions')->insert([
        'shipping_method_id' => $method->id,
        'restrictable_type' => 'category',
        'restrictable_id' => $category->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $method->load('restrictedProducts', 'restrictedCategories');

    expect($method->isRestrictedFor([], [$category->id]))->toBeTrue();
});

it('returns false when restricted product is not in the given list', function (): void {
    $method = ShippingMethod::factory()->create();
    $product = Product::factory()->create();
    $otherProduct = Product::factory()->create();

    DB::table('shipping_method_restrictions')->insert([
        'shipping_method_id' => $method->id,
        'restrictable_type' => 'product',
        'restrictable_id' => $product->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $method->load('restrictedProducts', 'restrictedCategories');

    expect($method->isRestrictedFor([$otherProduct->id], []))->toBeFalse();
});

// ── Admin: addRestriction endpoint ───────────────────────────────────────────

it('admin can add a product restriction', function (): void {
    $method = ShippingMethod::factory()->create();
    $product = Product::factory()->create();

    $this->actingAs($this->user)
        ->postJson(route('admin.ecommerce.shipping-methods.restrictions.add', $method), [
            'type' => 'product',
            'id' => $product->id,
        ])
        ->assertSuccessful()
        ->assertJsonPath('id', $product->id);

    expect(DB::table('shipping_method_restrictions')
        ->where('shipping_method_id', $method->id)
        ->where('restrictable_type', 'product')
        ->where('restrictable_id', $product->id)
        ->exists()
    )->toBeTrue();
});

it('admin can add a category restriction', function (): void {
    $method = ShippingMethod::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs($this->user)
        ->postJson(route('admin.ecommerce.shipping-methods.restrictions.add', $method), [
            'type' => 'category',
            'id' => $category->id,
        ])
        ->assertSuccessful()
        ->assertJsonPath('id', $category->id);

    expect(DB::table('shipping_method_restrictions')
        ->where('shipping_method_id', $method->id)
        ->where('restrictable_type', 'category')
        ->where('restrictable_id', $category->id)
        ->exists()
    )->toBeTrue();
});

it('adding a restriction with invalid type returns 422', function (): void {
    $method = ShippingMethod::factory()->create();

    $this->actingAs($this->user)
        ->postJson(route('admin.ecommerce.shipping-methods.restrictions.add', $method), [
            'type' => 'invalid',
            'id' => 1,
        ])
        ->assertUnprocessable();
});

it('adding a restriction for non-existent product returns 404', function (): void {
    $method = ShippingMethod::factory()->create();

    $this->actingAs($this->user)
        ->postJson(route('admin.ecommerce.shipping-methods.restrictions.add', $method), [
            'type' => 'product',
            'id' => 99999,
        ])
        ->assertNotFound();
});

// ── Admin: removeRestriction endpoint ────────────────────────────────────────

it('admin can remove a product restriction', function (): void {
    $method = ShippingMethod::factory()->create();
    $product = Product::factory()->create();

    DB::table('shipping_method_restrictions')->insert([
        'shipping_method_id' => $method->id,
        'restrictable_type' => 'product',
        'restrictable_id' => $product->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->deleteJson(route('admin.ecommerce.shipping-methods.restrictions.remove', $method), [
            'type' => 'product',
            'id' => $product->id,
        ])
        ->assertSuccessful()
        ->assertJsonPath('removed', true);

    expect(DB::table('shipping_method_restrictions')
        ->where('shipping_method_id', $method->id)
        ->where('restrictable_type', 'product')
        ->where('restrictable_id', $product->id)
        ->exists()
    )->toBeFalse();
});

// ── Admin: searchRestrictable endpoint ───────────────────────────────────────

it('search endpoint returns matching products', function (): void {
    Product::factory()->create(['name' => ['en' => 'Bluetooth Speaker', 'pl' => 'Głośnik']]);
    Product::factory()->create(['name' => ['en' => 'Bluetooth Headphones', 'pl' => 'Słuchawki']]);
    Product::factory()->create(['name' => ['en' => 'Laptop', 'pl' => 'Laptop']]);

    $this->actingAs($this->user)
        ->getJson(route('admin.ecommerce.shipping-methods.search-restrictable', ['q' => 'Bluetooth', 'type' => 'product']))
        ->assertSuccessful()
        ->assertJsonCount(2);
});

it('search endpoint returns matching categories', function (): void {
    Category::factory()->create(['name' => ['en' => 'Electronics', 'pl' => 'Elektronika']]);
    Category::factory()->create(['name' => ['en' => 'Books', 'pl' => 'Książki']]);

    $this->actingAs($this->user)
        ->getJson(route('admin.ecommerce.shipping-methods.search-restrictable', ['q' => 'Elec', 'type' => 'category']))
        ->assertSuccessful()
        ->assertJsonCount(1);
});

it('search with empty query returns empty results', function (): void {
    $this->actingAs($this->user)
        ->getJson(route('admin.ecommerce.shipping-methods.search-restrictable', ['q' => '', 'type' => 'product']))
        ->assertSuccessful()
        ->assertJsonCount(0);
});
