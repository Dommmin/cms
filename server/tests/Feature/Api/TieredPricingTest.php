<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\ProductVariantPriceTier;
use Illuminate\Support\Str;

function makeTieredVariant(int $basePrice = 10000): ProductVariant
{
    $type = ProductType::query()->firstOrCreate(
        ['slug' => 'tiered-simple'],
        ['name' => 'Tiered Simple', 'has_variants' => false, 'is_shippable' => true]
    );

    $cat = Category::query()->firstOrCreate(
        ['slug' => 'tiered-cat'],
        ['name' => 'Tiered Cat', 'is_active' => true]
    );

    $product = Product::query()->create([
        'name' => 'Tiered Product '.Str::random(4),
        'slug' => 'tiered-prod-'.Str::random(8),
        'product_type_id' => $type->id,
        'category_id' => $cat->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);

    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'TP-'.Str::random(6),
        'name' => 'Default',
        'price' => $basePrice,
        'stock_quantity' => 100,
        'is_active' => true,
    ]);

    // Tiers: 1-9 → 10000, 10-49 → 9000, 50+ → 8000
    ProductVariantPriceTier::query()->create([
        'product_variant_id' => $variant->id,
        'min_quantity' => 1,
        'max_quantity' => 9,
        'price' => 10000,
    ]);
    ProductVariantPriceTier::query()->create([
        'product_variant_id' => $variant->id,
        'min_quantity' => 10,
        'max_quantity' => 49,
        'price' => 9000,
    ]);
    ProductVariantPriceTier::query()->create([
        'product_variant_id' => $variant->id,
        'min_quantity' => 50,
        'max_quantity' => null,
        'price' => 8000,
    ]);

    return $variant;
}

// ---------------------------------------------------------------------------
// Unit: ProductVariant::getPriceForQuantity
// ---------------------------------------------------------------------------

describe('TieredPricing – getPriceForQuantity', function (): void {
    it('returns base price when no tiers exist', function (): void {
        $variant = makeTieredVariant(5000);
        // Delete all tiers for this variant
        ProductVariantPriceTier::query()->where('product_variant_id', $variant->id)->delete();

        expect($variant->getPriceForQuantity(1))->toBe(5000);
        expect($variant->getPriceForQuantity(100))->toBe(5000);
    });

    it('applies tier 1 for quantity in range 1-9', function (): void {
        $variant = makeTieredVariant();

        expect($variant->getPriceForQuantity(1))->toBe(10000);
        expect($variant->getPriceForQuantity(5))->toBe(10000);
        expect($variant->getPriceForQuantity(9))->toBe(10000);
    });

    it('applies tier 2 for quantity in range 10-49', function (): void {
        $variant = makeTieredVariant();

        expect($variant->getPriceForQuantity(10))->toBe(9000);
        expect($variant->getPriceForQuantity(25))->toBe(9000);
        expect($variant->getPriceForQuantity(49))->toBe(9000);
    });

    it('applies tier 3 for quantity 50+', function (): void {
        $variant = makeTieredVariant();

        expect($variant->getPriceForQuantity(50))->toBe(8000);
        expect($variant->getPriceForQuantity(100))->toBe(8000);
        expect($variant->getPriceForQuantity(999))->toBe(8000);
    });

    it('works with eager-loaded priceTiers relation', function (): void {
        $variant = makeTieredVariant();
        $variant->load('priceTiers');

        expect($variant->getPriceForQuantity(10))->toBe(9000);
    });
});

// ---------------------------------------------------------------------------
// Unit: CartItem::unitPrice and subtotal
// ---------------------------------------------------------------------------

describe('TieredPricing – CartItem unit price and subtotal', function (): void {
    it('cart item uses tiered unit price and correct subtotal', function (): void {
        $variant = makeTieredVariant();
        $variant->load('priceTiers');

        $cart = Cart::query()->create(['token' => Str::uuid()]);

        /** @var CartItem $item */
        $item = CartItem::query()->create([
            'cart_id' => $cart->id,
            'variant_id' => $variant->id,
            'quantity' => 10, // should hit tier 2 → 9000
        ]);
        $item->setRelation('variant', $variant);

        expect($item->unitPrice())->toBe(9000);
        expect($item->subtotal())->toBe(9000 * 10);
    });

    it('subtotal equals unit_price × quantity for base price variant', function (): void {
        $type = ProductType::query()->firstOrCreate(
            ['slug' => 'no-tier-type'],
            ['name' => 'No Tier', 'has_variants' => false, 'is_shippable' => true]
        );
        $cat = Category::query()->firstOrCreate(
            ['slug' => 'no-tier-cat'],
            ['name' => 'No Tier Cat', 'is_active' => true]
        );
        $product = Product::query()->create([
            'name' => 'No Tier Product',
            'slug' => 'no-tier-'.Str::random(8),
            'product_type_id' => $type->id,
            'category_id' => $cat->id,
            'is_active' => true,
            'is_saleable' => true,
        ]);
        $variant = ProductVariant::query()->create([
            'product_id' => $product->id,
            'sku' => 'NT-'.Str::random(6),
            'name' => 'Default',
            'price' => 2500,
            'stock_quantity' => 50,
            'is_active' => true,
        ]);

        $cart = Cart::query()->create(['token' => Str::uuid()]);
        /** @var CartItem $item */
        $item = CartItem::query()->create([
            'cart_id' => $cart->id,
            'variant_id' => $variant->id,
            'quantity' => 3,
        ]);
        $item->setRelation('variant', $variant);

        expect($item->unitPrice())->toBe(2500);
        expect($item->subtotal())->toBe(7500);
    });
});

// ---------------------------------------------------------------------------
// Integration: cart API respects tiered pricing
// ---------------------------------------------------------------------------

describe('TieredPricing – cart API integration', function (): void {
    it('cart API uses base price when quantity is below first tier threshold', function (): void {
        $variant = makeTieredVariant(basePrice: 10000);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1])
            ->assertOk();

        $response = $this->getJson('/api/v1/cart')->assertOk();

        expect($response->json('items.0.unit_price'))->toBe(10000);
        expect($response->json('items.0.subtotal'))->toBe(10000);
        expect($response->json('subtotal'))->toBe(10000);
    });

    it('cart API applies tier price for quantity matching second tier', function (): void {
        $variant = makeTieredVariant(basePrice: 10000);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 10])
            ->assertOk();

        $response = $this->getJson('/api/v1/cart')->assertOk();

        // qty=10 → tier 2 → 9000/unit
        expect($response->json('items.0.unit_price'))->toBe(9000);
        expect($response->json('items.0.subtotal'))->toBe(90000);
        expect($response->json('subtotal'))->toBe(90000);
    });

    it('cart API applies unlimited tier for large quantity', function (): void {
        $variant = makeTieredVariant(basePrice: 10000);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 50])
            ->assertOk();

        $response = $this->getJson('/api/v1/cart')->assertOk();

        // qty=50 → tier 3 → 8000/unit
        expect($response->json('items.0.unit_price'))->toBe(8000);
        expect($response->json('items.0.subtotal'))->toBe(400000);
        expect($response->json('subtotal'))->toBe(400000);
    });

    it('subtotal equals unit_price times quantity always', function (): void {
        $variant = makeTieredVariant(basePrice: 10000);

        $this->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 25])
            ->assertOk();

        $response = $this->getJson('/api/v1/cart')->assertOk();
        $unitPrice = $response->json('items.0.unit_price');
        $subtotal = $response->json('items.0.subtotal');

        expect($subtotal)->toBe($unitPrice * 25);
    });
});
