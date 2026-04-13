<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\User;
use Database\Seeders\CurrencySeeder;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function (): void {
    seed([
        RolePermissionSeeder::class,
        CurrencySeeder::class,
    ]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('bulk updates status for multiple orders', function (): void {
    $orders = Order::factory()->count(3)->processing()->create();

    $response = actingAs($this->admin, 'sanctum')
        ->post(route('admin.ecommerce.orders.bulk-update-status'), [
            'ids' => $orders->pluck('id')->toArray(),
            'status' => 'shipped',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    foreach ($orders as $order) {
        expect((string) $order->fresh()->status)->toBe('shipped');
    }
});

it('skips orders that cannot transition without error', function (): void {
    $processable = Order::factory()->processing()->create();
    $delivered = Order::factory()->delivered()->create(); // cannot go back to shipped

    $response = actingAs($this->admin, 'sanctum')
        ->post(route('admin.ecommerce.orders.bulk-update-status'), [
            'ids' => [$processable->id, $delivered->id],
            'status' => 'shipped',
        ]);

    $response->assertRedirect();

    expect((string) $processable->fresh()->status)->toBe('shipped');
    expect((string) $delivered->fresh()->status)->toBe('delivered'); // unchanged
});

it('returns success message with count of updated orders', function (): void {
    $orders = Order::factory()->count(2)->processing()->create();

    $response = actingAs($this->admin, 'sanctum')
        ->post(route('admin.ecommerce.orders.bulk-update-status'), [
            'ids' => $orders->pluck('id')->toArray(),
            'status' => 'shipped',
        ]);

    $response->assertSessionHas('success', '2 orders updated.');
});

it('validates max 100 orders', function (): void {
    $ids = range(1, 101);

    $response = actingAs($this->admin, 'sanctum')
        ->post(route('admin.ecommerce.orders.bulk-update-status'), [
            'ids' => $ids,
            'status' => 'shipped',
        ]);

    $response->assertSessionHasErrors(['ids']);
});

it('validates status enum value', function (): void {
    $order = Order::factory()->processing()->create();

    $response = actingAs($this->admin, 'sanctum')
        ->post(route('admin.ecommerce.orders.bulk-update-status'), [
            'ids' => [$order->id],
            'status' => 'invalid_status',
        ]);

    $response->assertSessionHasErrors(['status']);
});

it('requires ids to not be empty', function (): void {
    $response = actingAs($this->admin, 'sanctum')
        ->post(route('admin.ecommerce.orders.bulk-update-status'), [
            'ids' => [],
            'status' => 'shipped',
        ]);

    $response->assertSessionHasErrors(['ids']);
});

it('requires admin authentication', function (): void {
    $order = Order::factory()->processing()->create();

    $response = $this->post(route('admin.ecommerce.orders.bulk-update-status'), [
        'ids' => [$order->id],
        'status' => 'shipped',
    ]);

    // Admin routes return 404 for unauthenticated requests (no web session)
    $response->assertStatus(404);

    expect((string) $order->fresh()->status)->toBe('processing');
});
