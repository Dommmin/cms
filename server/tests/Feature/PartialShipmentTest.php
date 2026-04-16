<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Shipment;
use App\Models\ShipmentItem;
use App\Models\User;
use App\Services\ShipmentService;
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

test('createPartialShipment creates shipment and shipment items', function (): void {
    $order = Order::factory()->processing()->create();
    $item1 = OrderItem::factory()->for($order)->create(['quantity' => 3, 'shipped_quantity' => 0]);
    $item2 = OrderItem::factory()->for($order)->create(['quantity' => 2, 'shipped_quantity' => 0]);

    $service = app(ShipmentService::class);
    $shipment = $service->createPartialShipment(
        $order,
        [
            ['order_item_id' => $item1->id, 'quantity' => 2],
        ],
        ['carrier' => 'DHL', 'tracking_number' => 'TRACK123'],
    );

    expect($shipment)->toBeInstanceOf(Shipment::class);
    expect(ShipmentItem::query()->where('shipment_id', $shipment->id)->count())->toBe(1);

    $item1->refresh();
    expect($item1->shipped_quantity)->toBe(2);

    $item2->refresh();
    expect($item2->shipped_quantity)->toBe(0);
});

test('createPartialShipment does not exceed remaining quantity', function (): void {
    $order = Order::factory()->processing()->create();
    $item = OrderItem::factory()->for($order)->create(['quantity' => 2, 'shipped_quantity' => 1]);

    $service = app(ShipmentService::class);
    $service->createPartialShipment(
        $order,
        [['order_item_id' => $item->id, 'quantity' => 99]],
        [],
    );

    $item->refresh();
    // Only 1 remaining (2 - 1), so shipped_quantity should be 2 total
    expect($item->shipped_quantity)->toBe(2);
});

test('createPartialShipment sets order status to shipped when all items shipped', function (): void {
    $order = Order::factory()->processing()->create();
    $item = OrderItem::factory()->for($order)->create(['quantity' => 1, 'shipped_quantity' => 0]);

    $service = app(ShipmentService::class);
    $service->createPartialShipment(
        $order,
        [['order_item_id' => $item->id, 'quantity' => 1]],
        [],
    );

    $order->refresh();
    expect($order->status->getValue())->toBe('shipped');
});

test('admin can create shipment via HTTP', function (): void {
    $order = Order::factory()->processing()->create();
    $item = OrderItem::factory()->for($order)->create(['quantity' => 3, 'shipped_quantity' => 0]);

    $response = actingAs($this->admin)
        ->post(route('admin.ecommerce.orders.shipments.store', $order), [
            'carrier' => 'InPost',
            'tracking_number' => 'TEST999',
            'items' => [
                ['order_item_id' => $item->id, 'quantity' => 2],
            ],
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Shipment::query()->where('order_id', $order->id)->count())->toBe(1);
    expect(ShipmentItem::query()->count())->toBe(1);

    $item->refresh();
    expect($item->shipped_quantity)->toBe(2);
});

test('admin create shipment validates required items', function (): void {
    $order = Order::factory()->processing()->create();

    $response = actingAs($this->admin)
        ->post(route('admin.ecommerce.orders.shipments.store', $order), [
            'items' => [],
        ]);

    $response->assertSessionHasErrors('items');
});

test('order item remaining_to_ship accessor returns correct value', function (): void {
    $order = Order::factory()->create();
    $item = OrderItem::factory()->for($order)->create(['quantity' => 5, 'shipped_quantity' => 2]);

    expect($item->remaining_to_ship)->toBe(3);
    expect($item->isFullyShipped())->toBeFalse();

    $item->shipped_quantity = 5;
    expect($item->isFullyShipped())->toBeTrue();
    expect($item->remaining_to_ship)->toBe(0);
});
