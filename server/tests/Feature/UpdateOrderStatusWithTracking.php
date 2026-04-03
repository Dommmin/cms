<?php

declare(strict_types=1);

use App\Enums\OrderStatusEnum;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\ShippingMethod;
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

    $this->customer = Customer::factory()->create();
    $this->order = Order::factory()->create([
        'customer_id' => $this->customer->id,
        'status' => OrderStatusEnum::PROCESSING->value,
    ]);

    $shippingMethod = ShippingMethod::factory()->create();
    Shipment::factory()->create([
        'order_id' => $this->order->id,
        'shipping_method_id' => $shippingMethod->id,
    ]);
});

it('updates tracking number and url when marking order as shipped', function (): void {
    $response = actingAs($this->admin, 'sanctum')
        ->patch(route('admin.ecommerce.orders.update-status', $this->order), [
            'status' => 'shipped',
            'tracking_number' => 'ABC123XYZ',
            'tracking_url' => 'https://tracking.example.com/ABC123XYZ',
        ]);

    $response->assertRedirect();

    $this->order->refresh();
    expect((string) $this->order->status)->toBe('shipped');

    $this->order->shipment->refresh();
    expect($this->order->shipment->tracking_number)->toBe('ABC123XYZ')
        ->and($this->order->shipment->tracking_url)->toBe('https://tracking.example.com/ABC123XYZ');
});

it('validates tracking url format', function (): void {
    $response = actingAs($this->admin, 'sanctum')
        ->patch(route('admin.ecommerce.orders.update-status', $this->order), [
            'status' => 'shipped',
            'tracking_url' => 'invalid-url',
        ]);

    $response->assertSessionHasErrors(['tracking_url']);
});

it('allows empty tracking fields', function (): void {
    $response = actingAs($this->admin, 'sanctum')
        ->patch(route('admin.ecommerce.orders.update-status', $this->order), [
            'status' => 'shipped',
        ]);

    $response->assertRedirect();

    $this->order->refresh();
    $this->order->shipment->refresh();

    expect($this->order->shipment->tracking_number)->toBeNull()
        ->and($this->order->shipment->tracking_url)->toBeNull();
});
