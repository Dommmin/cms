<?php

declare(strict_types=1);

use App\Jobs\DeliverWebhookJob;
use App\Models\User;
use App\Models\Webhook;
use App\Models\WebhookDelivery;
use App\Services\WebhookService;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
});

it('can list webhooks', function (): void {
    Webhook::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('admin.webhooks.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('webhooks', 3));
});

it('can create a webhook', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.webhooks.store'), [
            'name' => 'Order Webhook',
            'url' => 'https://example.com/webhook',
            'description' => 'Notifies on order events',
            'events' => ['order.created', 'order.paid'],
            'is_active' => true,
        ])
        ->assertRedirect(route('admin.webhooks.index'));

    $webhook = Webhook::query()->first();
    expect($webhook->name)->toBe('Order Webhook');
    expect($webhook->events)->toBe(['order.created', 'order.paid']);
    expect($webhook->secret)->toHaveLength(64);
    expect($webhook->is_active)->toBeTrue();
});

it('validates required fields on store', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.webhooks.store'), [])
        ->assertSessionHasErrors(['name', 'url', 'events']);
});

it('validates url format on store', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.webhooks.store'), [
            'name' => 'Test',
            'url' => 'not-a-url',
            'events' => ['order.created'],
        ])
        ->assertSessionHasErrors(['url']);
});

it('can edit a webhook', function (): void {
    $webhook = Webhook::factory()->create();

    $this->actingAs($this->user)
        ->get(route('admin.webhooks.edit', $webhook))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('webhook')
            ->has('available_events')
        );
});

it('can update a webhook', function (): void {
    $webhook = Webhook::factory()->create([
        'name' => 'Old Name',
        'is_active' => true,
    ]);

    $this->actingAs($this->user)
        ->patch(route('admin.webhooks.update', $webhook), [
            'name' => 'New Name',
            'url' => 'https://updated.example.com/hook',
            'description' => null,
            'events' => ['order.shipped'],
            'is_active' => false,
        ])
        ->assertRedirect(route('admin.webhooks.index'));

    $webhook->refresh();
    expect($webhook->name)->toBe('New Name');
    expect($webhook->is_active)->toBeFalse();
    expect($webhook->events)->toBe(['order.shipped']);
});

it('can soft-delete a webhook', function (): void {
    $webhook = Webhook::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('admin.webhooks.destroy', $webhook))
        ->assertRedirect(route('admin.webhooks.index'));

    $this->assertSoftDeleted('webhooks', ['id' => $webhook->id]);
});

it('can view webhook deliveries', function (): void {
    $webhook = Webhook::factory()->create();
    WebhookDelivery::factory()->count(5)->create(['webhook_id' => $webhook->id]);

    $this->actingAs($this->user)
        ->get(route('admin.webhooks.deliveries', $webhook))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('webhook')
            ->has('deliveries')
        );
});

it('dispatches webhook job for active webhooks on service dispatch', function (): void {
    Queue::fake();

    Webhook::factory()->create([
        'events' => ['order.created'],
        'is_active' => true,
    ]);
    Webhook::factory()->create([
        'events' => ['order.paid'],
        'is_active' => true,
    ]);
    Webhook::factory()->create([
        'events' => ['order.created'],
        'is_active' => false,
    ]);

    resolve(WebhookService::class)->dispatch('order.created', ['order_id' => 1]);

    Queue::assertPushed(DeliverWebhookJob::class, 1);
});

it('generates secret automatically on create', function (): void {
    $webhook = Webhook::factory()->create();
    expect($webhook->secret)->not->toBeEmpty();
    expect(mb_strlen((string) $webhook->secret))->toBe(64);
});
