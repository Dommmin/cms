<?php

declare(strict_types=1);

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

beforeEach(function (): void {
    Config::set('services.baselinker.webhook_token', 'test-webhook-token');
    Config::set('services.baselinker.status_map', [
        1234 => 'processing',
        5678 => 'shipped',
    ]);
});

it('rejects webhook requests with missing token', function (): void {
    $this->postJson('/api/v1/webhooks/baselinker', [
        'action' => 'status',
        'order_id' => 'BL-100',
        'status_id' => 1234,
    ])->assertStatus(401);
});

it('rejects webhook requests with invalid token', function (): void {
    $this->withHeaders(['X-BL-Pass' => 'invalid-token'])
        ->postJson('/api/v1/webhooks/baselinker', [
            'action' => 'status',
            'order_id' => 'BL-100',
            'status_id' => 1234,
        ])->assertStatus(401);
});

it('accepts webhook with valid token in query param but rejects if token is mismatched', function (): void {
    $this->postJson('/api/v1/webhooks/baselinker?bl_pass=invalid-token', [
        'action' => 'status',
        'order_id' => 'BL-100',
        'status_id' => 1234,
    ])->assertStatus(401);
});

it('accepts webhook with valid token in query param', function (): void {
    $this->postJson('/api/v1/webhooks/baselinker?bl_pass=test-webhook-token', [
        'action' => 'non-status-action',
    ])->assertOk();
});

it('accepts webhook with valid token in header', function (): void {
    $this->withHeaders(['X-BL-Pass' => 'test-webhook-token'])
        ->postJson('/api/v1/webhooks/baselinker', [
            'action' => 'non-status-action',
        ])->assertOk();
});

it('ignores webhook when action is not status', function (): void {
    $order = Order::factory()->create([
        'baselinker_order_id' => 'BL-100',
        'status' => OrderStatusEnum::PENDING->value,
    ]);

    $this->withHeaders(['X-BL-Pass' => 'test-webhook-token'])
        ->postJson('/api/v1/webhooks/baselinker', [
            'action' => 'other-action',
            'order_id' => 'BL-100',
            'status_id' => 1234,
        ])->assertOk();

    expect($order->fresh()->status->getValue())->toBe(OrderStatusEnum::PENDING->value);
});

it('logs warning and returns ok when order is not found locally', function (): void {
    Log::shouldReceive('warning')
        ->once()
        ->with('BaseLinker webhook: Order not found locally', ['baselinker_id' => 'BL-UNKNOWN']);

    $this->withHeaders(['X-BL-Pass' => 'test-webhook-token'])
        ->postJson('/api/v1/webhooks/baselinker', [
            'action' => 'status',
            'order_id' => 'BL-UNKNOWN',
            'status_id' => 1234,
        ])->assertOk();
});

it('changes order status when valid status mapping is found', function (): void {
    $order = Order::factory()->create([
        'baselinker_order_id' => 'BL-100',
        'status' => OrderStatusEnum::PENDING->value,
    ]);

    $this->withHeaders(['X-BL-Pass' => 'test-webhook-token'])
        ->postJson('/api/v1/webhooks/baselinker', [
            'action' => 'status',
            'order_id' => 'BL-100',
            'status_id' => 1234, // mapped to 'processing'
        ])->assertOk();

    expect($order->fresh()->status->getValue())->toBe(OrderStatusEnum::PROCESSING->value);
});

it('ignores status change when mapping is not defined', function (): void {
    $order = Order::factory()->create([
        'baselinker_order_id' => 'BL-100',
        'status' => OrderStatusEnum::PENDING->value,
    ]);

    $this->withHeaders(['X-BL-Pass' => 'test-webhook-token'])
        ->postJson('/api/v1/webhooks/baselinker', [
            'action' => 'status',
            'order_id' => 'BL-100',
            'status_id' => 9999, // not mapped
        ])->assertOk();

    expect($order->fresh()->status->getValue())->toBe(OrderStatusEnum::PENDING->value);
});
