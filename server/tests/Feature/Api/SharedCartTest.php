<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\SharedCart;
use App\Models\User;
use App\Services\SharedCartService;
use Illuminate\Support\Str;

function sharedCartMakeVariant(
    int $price = 2000,
    int $stock = 10,
    bool $active = true,
): ProductVariant {
    $type = ProductType::query()->firstOrCreate(
        ['slug' => 'shared-cart-simple'],
        ['name' => 'Shared Cart Simple', 'has_variants' => false, 'is_shippable' => true]
    );

    $cat = Category::query()->firstOrCreate(
        ['slug' => 'shared-cart-cat'],
        ['name' => 'Shared Cart Category', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => 'Shared Cart Product '.Str::random(4),
        'slug' => 'shared-cart-prod-'.Str::random(8),
        'product_type_id' => $type->id,
        'category_id' => $cat->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    return ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'SC-'.Str::random(6),
        'name' => 'Default',
        'price' => $price,
        'stock_quantity' => $stock,
        'is_active' => $active,
    ]);
}

function sharedCartMakeUser(): User
{
    $user = User::factory()->create();

    Customer::query()->firstOrCreate(
        ['user_id' => $user->id],
        ['email' => $user->email, 'first_name' => $user->name],
    );

    return $user;
}

describe('Shared cart', function (): void {
    it('creates a share link from the current guest cart and returns a preview', function (): void {
        $variant = sharedCartMakeVariant(price: 1599, stock: 5);
        $cartToken = Str::random(32);

        $this->withHeaders(['X-Cart-Token' => $cartToken])
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2])
            ->assertOk();

        $response = $this->withHeaders(['X-Cart-Token' => $cartToken])
            ->postJson('/api/v1/cart/share', ['expires_in_days' => 14])
            ->assertCreated()
            ->assertJsonStructure(['token', 'expires_at']);

        $publicToken = $response->json('token');

        expect($publicToken)->toBeString();
        $this->assertDatabaseHas('shared_carts', [
            'public_token' => $publicToken,
            'currency_code' => 'PLN',
        ]);

        $this->getJson('/api/v1/cart/shared/'.$publicToken)
            ->assertOk()
            ->assertJsonPath('items_count', 1)
            ->assertJsonPath('items.0.requested_quantity', 2)
            ->assertJsonPath('items.0.status', 'available')
            ->assertJsonPath('shared_subtotal', 3198);
    });

    it('imports a shared cart into a guest cart in merge mode', function (): void {
        $sharedVariant = sharedCartMakeVariant(price: 1200, stock: 8);
        $existingVariant = sharedCartMakeVariant(price: 900, stock: 6);

        $sourceCart = Cart::query()->create([
            'session_token' => Str::random(32),
            'discount_code' => 'SAVE10',
        ]);
        CartItem::query()->create([
            'cart_id' => $sourceCart->id,
            'variant_id' => $sharedVariant->id,
            'quantity' => 3,
        ]);

        $sharedCart = resolve(SharedCartService::class)->createFromCart($sourceCart, 'en');

        $targetToken = Str::random(32);
        $this->withHeaders(['X-Cart-Token' => $targetToken])
            ->postJson('/api/v1/cart/items', ['variant_id' => $existingVariant->id, 'quantity' => 1])
            ->assertOk();

        $importResponse = $this->withHeaders(['X-Cart-Token' => $targetToken])
            ->postJson('/api/v1/cart/shared/'.$sharedCart->public_token.'/import', ['mode' => 'merge'])
            ->assertOk()
            ->assertJsonPath('mode', 'merge')
            ->assertJsonPath('added_items', 1)
            ->assertJsonPath('merged_items', 0)
            ->assertJsonPath('discount_cleared', true);

        expect($importResponse->json('cart.items_count'))->toBe(4);

        $guestCart = Cart::query()->where('session_token', $targetToken)->firstOrFail();

        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $guestCart->id,
            'variant_id' => $existingVariant->id,
            'quantity' => 1,
        ]);
        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $guestCart->id,
            'variant_id' => $sharedVariant->id,
            'quantity' => 3,
        ]);
        $this->assertDatabaseHas('shared_carts', [
            'id' => $sharedCart->id,
            'uses_count' => 1,
        ]);
    });

    it('can replace the target cart during import', function (): void {
        $sharedVariant = sharedCartMakeVariant(price: 1300, stock: 4);
        $existingVariant = sharedCartMakeVariant(price: 800, stock: 5);

        $sourceCart = Cart::query()->create(['session_token' => Str::random(32)]);
        CartItem::query()->create([
            'cart_id' => $sourceCart->id,
            'variant_id' => $sharedVariant->id,
            'quantity' => 2,
        ]);

        $sharedCart = resolve(SharedCartService::class)->createFromCart($sourceCart, 'en');

        $targetToken = Str::random(32);
        $this->withHeaders(['X-Cart-Token' => $targetToken])
            ->postJson('/api/v1/cart/items', ['variant_id' => $existingVariant->id, 'quantity' => 2])
            ->assertOk();

        $this->withHeaders(['X-Cart-Token' => $targetToken])
            ->postJson('/api/v1/cart/shared/'.$sharedCart->public_token.'/import', ['mode' => 'replace'])
            ->assertOk()
            ->assertJsonPath('mode', 'replace')
            ->assertJsonPath('added_items', 1)
            ->assertJsonPath('cart.items_count', 2);

        $guestCart = Cart::query()->where('session_token', $targetToken)->firstOrFail();

        $this->assertDatabaseMissing('cart_items', [
            'cart_id' => $guestCart->id,
            'variant_id' => $existingVariant->id,
        ]);
        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $guestCart->id,
            'variant_id' => $sharedVariant->id,
            'quantity' => 2,
        ]);
    });

    it('marks items as partial or unavailable in the preview and import result', function (): void {
        $partialVariant = sharedCartMakeVariant(price: 2200, stock: 2);
        $inactiveVariant = sharedCartMakeVariant(price: 1700, stock: 5, active: false);

        $sourceCart = Cart::query()->create(['session_token' => Str::random(32)]);
        CartItem::query()->create([
            'cart_id' => $sourceCart->id,
            'variant_id' => $partialVariant->id,
            'quantity' => 5,
        ]);
        CartItem::query()->create([
            'cart_id' => $sourceCart->id,
            'variant_id' => $inactiveVariant->id,
            'quantity' => 1,
        ]);

        $sharedCart = resolve(SharedCartService::class)->createFromCart($sourceCart, 'en');

        $this->getJson('/api/v1/cart/shared/'.$sharedCart->public_token)
            ->assertOk()
            ->assertJsonPath('partial_items', 1)
            ->assertJsonPath('unavailable_items', 1)
            ->assertJsonPath('items.0.status', 'partial')
            ->assertJsonPath('items.1.status', 'unavailable');

        $targetToken = Str::random(32);
        $this->withHeaders(['X-Cart-Token' => $targetToken])
            ->postJson('/api/v1/cart/shared/'.$sharedCart->public_token.'/import', ['mode' => 'merge'])
            ->assertOk()
            ->assertJsonPath('added_items', 1)
            ->assertJsonPath('skipped_items', 1)
            ->assertJsonPath('partial_items', 1)
            ->assertJsonPath('cart.items_count', 2);
    });

    it('returns 410 for expired shared carts', function (): void {
        $sharedCart = SharedCart::factory()->expired()->create([
            'snapshot' => [
                'items' => [
                    [
                        'variant_id' => 1,
                        'quantity' => 1,
                        'shared_unit_price' => 1000,
                        'product_name' => 'Expired product',
                        'product_slug' => 'expired-product',
                        'product_thumbnail' => null,
                        'variant_name' => 'Default',
                        'sku' => 'EXP-1',
                    ],
                ],
            ],
        ]);

        $this->getJson('/api/v1/cart/shared/'.$sharedCart->public_token)
            ->assertStatus(410);

        $this->postJson('/api/v1/cart/shared/'.$sharedCart->public_token.'/import', ['mode' => 'merge'])
            ->assertStatus(410);
    });

    it('imports into the authenticated customer cart', function (): void {
        $user = sharedCartMakeUser();
        $customer = $user->customer()->firstOrFail();
        $sharedVariant = sharedCartMakeVariant(price: 1999, stock: 5);

        $sourceCart = Cart::query()->create(['session_token' => Str::random(32)]);
        CartItem::query()->create([
            'cart_id' => $sourceCart->id,
            'variant_id' => $sharedVariant->id,
            'quantity' => 2,
        ]);

        $sharedCart = resolve(SharedCartService::class)->createFromCart($sourceCart, 'en');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/shared/'.$sharedCart->public_token.'/import', ['mode' => 'merge'])
            ->assertOk()
            ->assertJsonPath('cart.items_count', 2)
            ->assertJsonPath('cart.token', null);

        $this->assertDatabaseHas('carts', ['customer_id' => $customer->id]);
    });
});
