<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Str;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function wlVariant(): ProductVariant
{
    $type = ProductType::query()->firstOrCreate(
        ['slug' => 'simple'],
        ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true]
    );

    $cat = Category::query()->firstOrCreate(
        ['slug' => 'wl-cat'],
        ['name' => 'WL Category', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => 'WL Product '.Str::random(4),
        'slug' => 'wl-prod-'.Str::random(8),
        'product_type_id' => $type->id,
        'category_id' => $cat->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    return ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'WL-'.Str::random(6),
        'name' => 'Default',
        'price' => 1000,
        'stock_quantity' => 5,
    ]);
}

// ---------------------------------------------------------------------------
// Authentication gate
// ---------------------------------------------------------------------------

describe('Wishlist – guest access', function (): void {
    it('guest can view wishlist — creates an empty one with token', function (): void {
        $this->getJson('/api/v1/wishlist')
            ->assertOk()
            ->assertJsonStructure(['id', 'items', 'token']);
    });

    it('guest can add item to wishlist via X-Wishlist-Token', function (): void {
        $variant = wlVariant();

        $response = $this->postJson('/api/v1/wishlist/items', ['variant_id' => $variant->id]);
        $response->assertOk()
            ->assertJsonCount(1, 'items');

        $token = $response->headers->get('X-Wishlist-Token');
        expect($token)->not->toBeEmpty();

        // Subsequent requests with token return the same wishlist
        $this->withHeaders(['X-Wishlist-Token' => $token])
            ->getJson('/api/v1/wishlist')
            ->assertOk()
            ->assertJsonCount(1, 'items');
    });

    it('guest can remove item from wishlist', function (): void {
        $variant = wlVariant();

        $response = $this->postJson('/api/v1/wishlist/items', ['variant_id' => $variant->id]);
        $token = $response->headers->get('X-Wishlist-Token');

        $this->withHeaders(['X-Wishlist-Token' => $token])
            ->deleteJson('/api/v1/wishlist/items/'.$variant->id)
            ->assertOk()
            ->assertJsonPath('items', []);
    });
});

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

describe('Wishlist – CRUD', function (): void {
    it('creates an empty wishlist for a new user on first access', function (): void {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/wishlist')
            ->assertOk()
            ->assertJsonStructure(['id', 'items'])
            ->assertJsonPath('items', []);
    });

    it('adds a product variant to the wishlist', function (): void {
        $user = User::factory()->create();
        $variant = wlVariant();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/wishlist/items', ['variant_id' => $variant->id])
            ->assertOk()
            ->assertJsonCount(1, 'items');
    });

    it('adding the same variant twice is idempotent — no duplicate items', function (): void {
        $user = User::factory()->create();
        $variant = wlVariant();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/wishlist/items', ['variant_id' => $variant->id]);

        // Use $user->fresh() to avoid stale relation cache that causes duplicate customer creation
        $this->actingAs($user->fresh(), 'sanctum')
            ->postJson('/api/v1/wishlist/items', ['variant_id' => $variant->id])
            ->assertOk()
            ->assertJsonCount(1, 'items');
    });

    it('removes a variant from the wishlist', function (): void {
        $user = User::factory()->create();
        $variant = wlVariant();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/wishlist/items', ['variant_id' => $variant->id]);

        $this->actingAs($user->fresh(), 'sanctum')
            ->deleteJson('/api/v1/wishlist/items/'.$variant->id)
            ->assertOk()
            ->assertJsonPath('items', []);
    });

    it('removing a variant that is not in the wishlist is a no-op', function (): void {
        $user = User::factory()->create();
        $variant = wlVariant();

        // Delete without adding first — should not throw
        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/wishlist/items/'.$variant->id)
            ->assertOk();
    });

    it('rejects invalid variant_id', function (): void {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/wishlist/items', ['variant_id' => 99999])
            ->assertUnprocessable();
    });
});

// ---------------------------------------------------------------------------
// Isolation — users cannot see each other's wishlists
// ---------------------------------------------------------------------------

describe('Wishlist – isolation', function (): void {
    it('each user has their own wishlist', function (): void {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $variant = wlVariant();

        // A adds an item
        $this->actingAs($userA, 'sanctum')
            ->postJson('/api/v1/wishlist/items', ['variant_id' => $variant->id]);

        // B's wishlist should be empty
        $this->actingAs($userB, 'sanctum')
            ->getJson('/api/v1/wishlist')
            ->assertOk()
            ->assertJsonPath('items', []);
    });
});
