<?php

declare(strict_types=1);

use App\Jobs\DeliverWebhookJob;
use App\Models\Page;
use App\Models\User;
use App\Models\Webhook;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin']);

    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
});

it('dispatches a page published webhook when a page is published manually', function (): void {
    Queue::fake();

    $page = Page::factory()->create([
        'title' => 'Landing',
        'slug' => 'landing',
        'is_published' => false,
    ]);

    Webhook::factory()->create([
        'events' => ['page.published'],
        'is_active' => true,
    ]);

    $this->actingAs($this->user)
        ->post(route('admin.cms.pages.publish', $page))
        ->assertRedirect();

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'page.published'
        && $job->payload['id'] === $page->id
        && $job->payload['slug'] === 'landing'
        && $job->payload['source'] === 'manual'
        && $job->payload['is_published'] === true);
});

it('dispatches a page unpublished webhook when a page is unpublished manually', function (): void {
    Queue::fake();

    $page = Page::factory()->published()->create([
        'title' => 'Landing',
        'slug' => 'landing',
    ]);

    Webhook::factory()->create([
        'events' => ['page.unpublished'],
        'is_active' => true,
    ]);

    $this->actingAs($this->user)
        ->post(route('admin.cms.pages.unpublish', $page))
        ->assertRedirect();

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'page.unpublished'
        && $job->payload['id'] === $page->id
        && $job->payload['source'] === 'manual'
        && $job->payload['is_published'] === false);
});

it('dispatches page publication webhooks for scheduled publish and unpublish', function (): void {
    Queue::fake();

    $publishPage = Page::factory()->create([
        'is_published' => false,
        'scheduled_publish_at' => now()->subMinute(),
    ]);
    $unpublishPage = Page::factory()->published()->create([
        'scheduled_unpublish_at' => now()->subMinute(),
    ]);

    Webhook::factory()->create([
        'events' => ['page.published', 'page.unpublished'],
        'is_active' => true,
    ]);

    $this->artisan('cms:process-scheduled-pages')->assertSuccessful();

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'page.published'
        && $job->payload['id'] === $publishPage->id
        && $job->payload['source'] === 'scheduled');

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'page.unpublished'
        && $job->payload['id'] === $unpublishPage->id
        && $job->payload['source'] === 'scheduled');
});
