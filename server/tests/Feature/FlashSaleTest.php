<?php

declare(strict_types=1);

use App\Models\FlashSale;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Date;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
});

// ── Model: active scope ───────────────────────────────────────────────────────

it('active scope returns currently running sales', function (): void {
    FlashSale::factory()->active()->create();
    FlashSale::factory()->scheduled()->create();
    FlashSale::factory()->ended()->create();

    expect(FlashSale::query()->active()->count())->toBe(1);
});

it('active scope excludes exhausted stock sales', function (): void {
    FlashSale::factory()->active()->withStockLimit(10, 10)->create();
    FlashSale::factory()->active()->withStockLimit(10, 5)->create();

    expect(FlashSale::query()->active()->count())->toBe(1);
});

it('active scope includes sales with null stock limit', function (): void {
    FlashSale::factory()->active()->create(['stock_limit' => null]);
    FlashSale::factory()->active()->withStockLimit(5, 5)->create();

    expect(FlashSale::query()->active()->count())->toBe(1);
});

// ── Model: isAvailable + stockRemaining ───────────────────────────────────────

it('isAvailable returns true for active sale within time window', function (): void {
    $sale = FlashSale::factory()->active()->make();
    expect($sale->isAvailable())->toBeTrue();
});

it('isAvailable returns false when inactive', function (): void {
    $sale = FlashSale::factory()->make(['is_active' => false]);
    expect($sale->isAvailable())->toBeFalse();
});

it('isAvailable returns false when stock exhausted', function (): void {
    $sale = FlashSale::factory()->active()->make(['stock_limit' => 5, 'stock_sold' => 5]);
    expect($sale->isAvailable())->toBeFalse();
});

it('stockRemaining returns null when no limit', function (): void {
    $sale = FlashSale::factory()->make(['stock_limit' => null, 'stock_sold' => 0]);
    expect($sale->stockRemaining())->toBeNull();
});

it('stockRemaining returns difference when limit set', function (): void {
    $sale = FlashSale::factory()->make(['stock_limit' => 10, 'stock_sold' => 3]);
    expect($sale->stockRemaining())->toBe(7);
});

it('stockRemaining returns zero when exhausted', function (): void {
    $sale = FlashSale::factory()->make(['stock_limit' => 5, 'stock_sold' => 5]);
    expect($sale->stockRemaining())->toBe(0);
});

// ── API: GET /api/v1/flash-sales ──────────────────────────────────────────────

it('returns active flash sales via API', function (): void {
    FlashSale::factory()->active()->count(2)->create();
    FlashSale::factory()->scheduled()->create();
    FlashSale::factory()->ended()->create();

    $response = $this->getJson('/api/v1/flash-sales');

    $response->assertOk();
    $response->assertJsonCount(2, 'data');
    $response->assertJsonStructure([
        'data' => [
            '*' => ['id', 'name', 'product_id', 'variant_id', 'sale_price', 'ends_at', 'stock_remaining'],
        ],
    ]);
});

// ── API: GET /api/v1/products/{slug}/flash-sale ───────────────────────────────

it('returns active flash sale for a specific product', function (): void {
    $product = Product::factory()->create();
    $sale = FlashSale::factory()->active()->create(['product_id' => $product->id]);

    $response = $this->getJson(sprintf('/api/v1/products/%s/flash-sale', $product->slug));

    $response->assertOk();
    $response->assertJsonFragment(['id' => $sale->id, 'product_id' => $product->id]);
});

it('returns null when no active flash sale for product', function (): void {
    $product = Product::factory()->create();

    $response = $this->getJson(sprintf('/api/v1/products/%s/flash-sale', $product->slug));

    $response->assertOk();
    $response->assertExactJson([]);
});

// ── Admin: CRUD ───────────────────────────────────────────────────────────────

it('admin can list flash sales', function (): void {
    FlashSale::factory()->count(3)->create();

    $response = $this->actingAs($this->user)
        ->get(route('admin.ecommerce.flash-sales.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/ecommerce/flash-sales/index')
        ->has('flashSales.data', 3)
    );
});

it('admin can view create form', function (): void {
    $response = $this->actingAs($this->user)
        ->get(route('admin.ecommerce.flash-sales.create'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/ecommerce/flash-sales/create')
    );
});

it('admin can create a flash sale', function (): void {
    $product = Product::factory()->create();
    $startsAt = Date::now()->subHour()->format('Y-m-d H:i:s');
    $endsAt = Date::now()->addDay()->format('Y-m-d H:i:s');

    $response = $this->actingAs($this->user)
        ->post(route('admin.ecommerce.flash-sales.store'), [
            'product_id' => $product->id,
            'name' => 'Weekend Sale',
            'sale_price' => 4999,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'is_active' => true,
        ]);

    $response->assertRedirect(route('admin.ecommerce.flash-sales.index'));

    expect(FlashSale::query()->count())->toBe(1);
    expect(FlashSale::query()->first()->name)->toBe('Weekend Sale');
    expect(FlashSale::query()->first()->sale_price)->toBe(4999);
});

it('admin store validates required fields', function (): void {
    $response = $this->actingAs($this->user)
        ->post(route('admin.ecommerce.flash-sales.store'), []);

    $response->assertSessionHasErrors(['product_id', 'name', 'sale_price', 'starts_at', 'ends_at']);
});

it('admin can edit a flash sale', function (): void {
    $sale = FlashSale::factory()->create();

    $response = $this->actingAs($this->user)
        ->get(route('admin.ecommerce.flash-sales.edit', $sale));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/ecommerce/flash-sales/edit')
        ->where('flashSale.id', $sale->id)
    );
});

it('admin can update a flash sale', function (): void {
    $sale = FlashSale::factory()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($this->user)
        ->put(route('admin.ecommerce.flash-sales.update', $sale), [
            'product_id' => $product->id,
            'name' => 'Updated Sale',
            'sale_price' => 9999,
            'starts_at' => Date::now()->subHour()->format('Y-m-d H:i:s'),
            'ends_at' => Date::now()->addDay()->format('Y-m-d H:i:s'),
            'is_active' => true,
        ]);

    $response->assertRedirect();

    expect($sale->fresh()->name)->toBe('Updated Sale');
    expect($sale->fresh()->sale_price)->toBe(9999);
});

it('admin can delete a flash sale', function (): void {
    $sale = FlashSale::factory()->create();

    $response = $this->actingAs($this->user)
        ->delete(route('admin.ecommerce.flash-sales.destroy', $sale));

    $response->assertRedirect();

    expect(FlashSale::query()->count())->toBe(0);
});

// ── Command ───────────────────────────────────────────────────────────────────

it('deactivate-expired command marks past sales inactive', function (): void {
    // Active sale that has expired
    FlashSale::factory()->create([
        'is_active' => true,
        'starts_at' => Date::now()->subDays(3),
        'ends_at' => Date::now()->subDay(),
        'stock_limit' => null,
    ]);
    // Still active
    FlashSale::factory()->active()->create();

    $this->artisan('flash-sales:deactivate-expired')->assertExitCode(0);

    expect(FlashSale::query()->where('is_active', true)->count())->toBe(1);
    expect(FlashSale::query()->where('is_active', false)->count())->toBe(1);
});

it('deactivate-expired command marks exhausted sales inactive', function (): void {
    FlashSale::factory()->active()->withStockLimit(5, 5)->create();

    $this->artisan('flash-sales:deactivate-expired')->assertExitCode(0);

    expect(FlashSale::query()->where('is_active', false)->count())->toBe(1);
});
