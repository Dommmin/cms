<?php

declare(strict_types=1);

use App\Enums\BlogPostStatusEnum;
use App\Jobs\DeliverWebhookJob;
use App\Models\BlogPost;
use App\Models\Product;
use App\Models\Webhook;
use Illuminate\Support\Facades\Queue;

it('dispatches a product.published webhook when product is created active', function (): void {
    Queue::fake();

    Webhook::factory()->create([
        'events' => ['product.published'],
        'is_active' => true,
    ]);

    $product = Product::factory()->create([
        'is_active' => true,
        'slug' => 'test-product',
    ]);

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'product.published'
        && $job->payload['id'] === $product->id
        && $job->payload['slug'] === 'test-product'
        && $job->payload['is_active'] === true);
});

it('dispatches product publish and unpublish webhooks on active status transition', function (): void {
    Queue::fake();

    $product = Product::factory()->create([
        'is_active' => false,
        'slug' => 'test-product',
    ]);

    Webhook::factory()->create([
        'events' => ['product.published', 'product.unpublished'],
        'is_active' => true,
    ]);

    $product->update(['is_active' => true]);

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'product.published'
        && $job->payload['id'] === $product->id
        && $job->payload['is_active'] === true);

    $product->update(['is_active' => false]);

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'product.unpublished'
        && $job->payload['id'] === $product->id
        && $job->payload['is_active'] === false);
});

it('dispatches a blog_post.published webhook when blog post is created published', function (): void {
    Queue::fake();

    Webhook::factory()->create([
        'events' => ['blog_post.published'],
        'is_active' => true,
    ]);

    $post = BlogPost::factory()->create([
        'status' => BlogPostStatusEnum::Published,
        'slug' => 'test-post',
    ]);

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'blog_post.published'
        && $job->payload['id'] === $post->id
        && $job->payload['slug'] === 'test-post'
        && $job->payload['status'] === 'published');
});

it('dispatches blog post publish and unpublish webhooks on status transition', function (): void {
    Queue::fake();

    $post = BlogPost::factory()->create([
        'status' => BlogPostStatusEnum::Draft,
        'slug' => 'test-post',
    ]);

    Webhook::factory()->create([
        'events' => ['blog_post.published', 'blog_post.unpublished'],
        'is_active' => true,
    ]);

    $post->update(['status' => BlogPostStatusEnum::Published]);

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'blog_post.published'
        && $job->payload['id'] === $post->id
        && $job->payload['status'] === 'published');

    $post->update(['status' => BlogPostStatusEnum::Draft]);

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'blog_post.unpublished'
        && $job->payload['id'] === $post->id
        && $job->payload['status'] === 'draft');
});
