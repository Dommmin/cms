<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\SettingTypeEnum;
use App\Enums\ShippingCarrierEnum;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\ShippingMethod;
use App\Models\TaxRate;
use App\Models\TaxZone;
use App\Models\TaxZoneCountry;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

if (! function_exists('makeTestVariantTax')) {
    function makeTestVariantTax(int $price = 2000, ?TaxRate $taxRate = null): ProductVariant
    {
        $type = ProductType::query()->firstOrCreate(
            ['slug' => 'simple'],
            ['name' => 'Simple', 'has_variants' => false, 'is_shippable' => true]
        );

        $cat = Category::query()->firstOrCreate(
            ['slug' => 'test-cat'],
            ['name' => 'Test', 'is_active' => true]
        );

        $product = Product::query()->create([
            'name' => 'Test Product '.Str::random(4),
            'slug' => 'test-prod-'.Str::random(8),
            'product_type_id' => $type->id,
            'category_id' => $cat->id,
            'is_active' => true,
            'is_saleable' => true,
        ]);

        return ProductVariant::query()->create([
            'product_id' => $product->id,
            'tax_rate_id' => $taxRate?->id,
            'sku' => 'TSK-'.Str::random(6),
            'name' => 'Default',
            'price' => $price,
            'stock_quantity' => 100,
            'is_active' => true,
        ]);
    }
}

if (! function_exists('makeTestAuthUserTax')) {
    function makeTestAuthUserTax(): User
    {
        $user = User::factory()->create();
        Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
            'last_name' => 'Test',
        ]);

        return $user;
    }
}

describe('Tax Engine & B2B Checkout', function (): void {
    beforeEach(function (): void {
        Http::fake([
            'ec.europa.eu/*' => Http::response(['isValid' => true], 200),
        ]);

        // Clear tax zones and rates to ensure predictable state
        TaxZoneCountry::query()->delete();
        TaxZone::query()->delete();
        TaxRate::query()->delete();

        // Seed default PL tax rates
        $this->taxRatePL23 = TaxRate::query()->create([
            'name' => 'VAT 23%',
            'rate' => 23,
            'country_code' => 'PL',
            'is_active' => true,
            'is_default' => true,
        ]);

        $this->taxRatePL8 = TaxRate::query()->create([
            'name' => 'VAT 8%',
            'rate' => 8,
            'country_code' => 'PL',
            'is_active' => true,
            'is_default' => false,
        ]);

        // Seed Shipping Method
        $this->shippingMethod = ShippingMethod::query()->firstOrCreate(
            ['name' => 'Kurier'],
            [
                'carrier' => ShippingCarrierEnum::PICKUP,
                'base_price' => 1500,
                'is_active' => true,
                'price_per_kg' => 0,
                'max_weight' => 999,
            ]
        );

        // Reset Settings
        Setting::query()->updateOrCreate(
            ['group' => 'ecommerce', 'key' => 'shipping_tax_behavior'],
            ['value' => 'highest_cart_rate', 'type' => SettingTypeEnum::String]
        );
        Notification::fake();
    });

    it('Scenario 1: Polish B2C (Domestic standard VAT)', function (): void {
        $variant = makeTestVariantTax(price: 12300, taxRate: $this->taxRatePL23); // 123.00 PLN Gross
        $user = makeTestAuthUserTax();

        // Add to cart
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        // Checkout
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $this->shippingMethod->id,
                'payment_provider' => 'cash_on_delivery',
                'customer_type' => 'individual',
                'wants_invoice' => true,
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
                'shipping_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ]);

        $response->assertStatus(201);

        $order = Order::query()->latest('id')->first();

        // 123.00 PLN gross (100.00 net, 23.00 VAT)
        // Shipping: 15.00 PLN gross (12.20 net, 2.80 VAT at 23%)
        // Total Tax: 23.00 + 2.80 = 25.80 PLN = 2580 cents
        expect($order->tax_amount)->toBe(2580);
        expect($order->items_tax_amount)->toBe(2300);
        expect($order->shipping_tax_amount)->toBe(280);
        expect($order->total)->toBe(13800); // 123.00 + 15.00 = 138.00
        expect($order->wants_invoice)->toBeTrue();
        expect($order->customer_type)->toBe('individual');
    });

    it('Scenario 2: Polish B2B (Domestic B2B, standard VAT applies)', function (): void {
        $variant = makeTestVariantTax(price: 12300, taxRate: $this->taxRatePL23);
        $user = makeTestAuthUserTax();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $this->shippingMethod->id,
                'payment_provider' => 'cash_on_delivery',
                'customer_type' => 'business',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'company_name' => 'Kowalski S.A.',
                    'vat_id' => '5260250995', // Valid Polish NIP (Ministerstwo Finansów)
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
                'shipping_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ]);

        $response->assertStatus(201);

        $order = Order::query()->latest('id')->first();

        expect($order->customer_type)->toBe('business');
        expect($order->buyer_company_name)->toBe('Kowalski S.A.');
        expect($order->buyer_vat_id)->toBe('5260250995');
        // Still standard VAT since it is domestic
        expect($order->tax_amount)->toBe(2580);
    });

    it('Scenario 3: EU B2C OSS (German consumer, DE 19% VAT rate)', function (): void {
        // Setup EU Tax Zone and DE rate
        $euZone = TaxZone::query()->create([
            'name' => 'European Union',
            'code' => 'EU',
            'is_active' => true,
        ]);

        TaxZoneCountry::query()->create([
            'tax_zone_id' => $euZone->id,
            'country_code' => 'DE',
        ]);

        $deRate = TaxRate::query()->create([
            'name' => 'German VAT 19%',
            'rate' => 19,
            'country_code' => 'DE',
            'tax_zone_id' => $euZone->id,
            'is_active' => true,
        ]);

        $variant = makeTestVariantTax(price: 11900, taxRate: $this->taxRatePL23); // PL 23% default
        $user = makeTestAuthUserTax();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $this->shippingMethod->id,
                'payment_provider' => 'cash_on_delivery',
                'customer_type' => 'individual',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Hans', 'last_name' => 'Müller',
                    'street' => 'Hauptstr. 12', 'city' => 'Berlin',
                    'postal_code' => '10115', 'country_code' => 'DE',
                    'phone' => '491234567',
                ],
                'shipping_address' => [
                    'first_name' => 'Hans', 'last_name' => 'Müller',
                    'street' => 'Hauptstr. 12', 'city' => 'Berlin',
                    'postal_code' => '10115', 'country_code' => 'DE',
                    'phone' => '491234567',
                ],
            ]);

        $response->assertStatus(201);

        $order = Order::query()->latest('id')->first();

        // German 19% should be matched via Tax Zone.
        // Item: 119.00 PLN Gross (100.00 Net, 19.00 VAT)
        // Shipping: 15.00 PLN Gross (12.61 Net, 2.39 VAT at 19%)
        // Total Tax: 19.00 + 2.39 = 21.39 PLN = 2139 cents
        expect($order->tax_amount)->toBe(2139);
        expect($order->items_tax_amount)->toBe(1900);
        expect($order->shipping_tax_amount)->toBe(239);
    });

    it('Scenario 4: EU B2B Reverse Charge (German business, 0% VAT)', function (): void {
        $variant = makeTestVariantTax(price: 12300, taxRate: $this->taxRatePL23);
        $user = makeTestAuthUserTax();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $this->shippingMethod->id,
                'payment_provider' => 'cash_on_delivery',
                'customer_type' => 'business',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Hans', 'last_name' => 'Müller',
                    'company_name' => 'Müller GmbH',
                    'vat_id' => 'DE123456789', // Valid format DE + 9 digits
                    'street' => 'Hauptstr. 12', 'city' => 'Berlin',
                    'postal_code' => '10115', 'country_code' => 'DE',
                    'phone' => '491234567',
                ],
                'shipping_address' => [
                    'first_name' => 'Hans', 'last_name' => 'Müller',
                    'street' => 'Hauptstr. 12', 'city' => 'Berlin',
                    'postal_code' => '10115', 'country_code' => 'DE',
                    'phone' => '491234567',
                ],
            ]);

        $response->assertStatus(201);

        $order = Order::query()->latest('id')->first();

        // Reverse charge applies! Tax should be 0.
        expect($order->tax_amount)->toBe(0);
        expect($order->items_tax_amount)->toBe(0);
        expect($order->shipping_tax_amount)->toBe(0);
        expect($order->total)->toBe(13800); // 12300 + 1500 = 13800
    });

    it('Scenario 5: Non-EU Export (US customer, exempt from VAT)', function (): void {
        $variant = makeTestVariantTax(price: 12300, taxRate: $this->taxRatePL23);
        $user = makeTestAuthUserTax();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $this->shippingMethod->id,
                'payment_provider' => 'cash_on_delivery',
                'customer_type' => 'individual',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'John', 'last_name' => 'Doe',
                    'street' => '5th Ave 10', 'city' => 'New York',
                    'postal_code' => '10001', 'country_code' => 'US',
                    'phone' => '12125550199',
                ],
                'shipping_address' => [
                    'first_name' => 'John', 'last_name' => 'Doe',
                    'street' => '5th Ave 10', 'city' => 'New York',
                    'postal_code' => '10001', 'country_code' => 'US',
                    'phone' => '12125550199',
                ],
            ]);

        $response->assertStatus(201);

        $order = Order::query()->latest('id')->first();

        // Export outside EU is exempt from tax
        expect($order->tax_amount)->toBe(0);
        expect($order->items_tax_amount)->toBe(0);
        expect($order->shipping_tax_amount)->toBe(0);
    });

    it('Scenario 6: Shipping Tax Behavior (highest rate vs fixed)', function (): void {
        // Setup cart with 8% VAT item
        $variant = makeTestVariantTax(price: 10800, taxRate: $this->taxRatePL8);
        $user = makeTestAuthUserTax();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        // Default behavior: highest rate in cart (here 8%)
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $this->shippingMethod->id,
                'payment_provider' => 'cash_on_delivery',
                'customer_type' => 'individual',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
                'shipping_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ]);

        $response->assertStatus(201);

        $order = Order::query()->latest('id')->first();

        // Item VAT: 800
        // Shipping VAT: 15.00 PLN gross with 8% VAT applied -> 111 cents
        // Total Tax: 800 + 111 = 911
        expect($order->shipping_tax_amount)->toBe(111);

        // Fixed shipping tax rate behavior (e.g. always 23%)
        Setting::query()->updateOrCreate(
            ['group' => 'ecommerce', 'key' => 'shipping_tax_behavior'],
            ['value' => 'fixed', 'type' => SettingTypeEnum::String]
        );
        $this->shippingMethod->update(['tax_rate_id' => $this->taxRatePL23->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $response2 = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $this->shippingMethod->id,
                'payment_provider' => 'cash_on_delivery',
                'customer_type' => 'individual',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
                'shipping_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ]);

        $response2->assertStatus(201);

        $order2 = Order::query()->latest('id')->first();

        // Item VAT: 800 (at 8% rate)
        // Shipping VAT: 1500 with 23% VAT applied -> 280 cents
        expect($order2->shipping_tax_amount)->toBe(280);
    });

    it('Scenario 7: B2B Validation Failures (missing company, invalid NIP)', function (): void {
        $variant = makeTestVariantTax();
        $user = makeTestAuthUserTax();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        // 7.1: Missing company_name and vat_id when business
        $response1 = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $this->shippingMethod->id,
                'payment_provider' => 'cash_on_delivery',
                'customer_type' => 'business',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
                'shipping_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ]);

        $response1->assertStatus(422)
            ->assertJsonValidationErrors(['billing_address.company_name', 'billing_address.vat_id']);

        // 7.2: Invalid Polish NIP checksum
        $response2 = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $this->shippingMethod->id,
                'payment_provider' => 'cash_on_delivery',
                'customer_type' => 'business',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'company_name' => 'Kowalski S.A.',
                    'vat_id' => '1234567890', // Invalid checksum
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
                'shipping_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ]);

        $response2->assertStatus(422)
            ->assertJsonValidationErrors(['billing_address.vat_id']);
    });

    it('Scenario 8: Proforma Invoice Generation and Download', function (): void {
        $variant = makeTestVariantTax(price: 12300, taxRate: $this->taxRatePL23);
        $user = makeTestAuthUserTax();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_method_id' => $this->shippingMethod->id,
                'payment_provider' => 'cash_on_delivery',
                'customer_type' => 'individual',
                'terms_accepted' => true,
                'billing_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
                'shipping_address' => [
                    'first_name' => 'Jan', 'last_name' => 'Kowalski',
                    'street' => 'Wiejska 1', 'city' => 'Warszawa',
                    'postal_code' => '00-001', 'country_code' => 'PL',
                    'phone' => '123123123',
                ],
            ]);

        $order = Order::query()->latest('id')->first();
        expect($order->invoice_number)->toBeNull();

        // Request Proforma PDF download
        $response = $this->actingAs($user, 'sanctum')
            ->getJson(sprintf('/api/v1/orders/%s/proforma', $order->reference_number));

        // Should return PDF download response (typically 200 with headers)
        $response->assertStatus(200)
            ->assertHeader('content-type', 'application/pdf');

        // Verify order does NOT have a final invoice number yet
        expect($order->fresh()->invoice_number)->toBeNull();
    });
});
