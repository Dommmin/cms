<?php

declare(strict_types=1);

use App\Enums\BlogPostStatusEnum;
use App\Jobs\DeliverWebhookJob;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\CategoryAttributeSchema;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Webhook;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;

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

it('dispatches a product.updated webhook when only product attribute values change', function (): void {
    Queue::fake();

    Webhook::factory()->create([
        'events' => ['product.updated'],
        'is_active' => true,
    ]);

    $productType = ProductType::factory()->create(['has_variants' => false]);
    $category = Category::factory()->create(['product_type_id' => $productType->id]);
    $material = Attribute::factory()->create([
        'name' => 'Material',
        'slug' => 'material',
        'type' => 'select',
        'is_filterable' => true,
    ]);
    $steel = AttributeValue::factory()->for($material)->create([
        'value' => 'Steel',
        'slug' => 'steel',
    ]);

    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $material->id,
        'is_required' => false,
        'position' => 0,
    ]);

    Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $product = Product::factory()->create([
        'name' => ['en' => 'Webhook product'],
        'slug' => ['en' => 'webhook-product'],
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
        'is_active' => true,
        'is_saleable' => true,
    ]);
    $variant = ProductVariant::factory()->for($product)->default()->active()->create([
        'sku' => 'WEBHOOK-001',
        'price' => 19900,
        'stock_quantity' => 5,
    ]);

    $this->actingAs($admin)
        ->put(route('admin.ecommerce.products.update', $product), [
            'name' => ['en' => 'Webhook product'],
            'slug' => ['en' => 'webhook-product'],
            'description' => ['en' => 'Webhook product'],
            'short_description' => ['en' => 'Webhook product'],
            'product_type_id' => $productType->id,
            'category_id' => $category->id,
            'is_active' => true,
            'is_saleable' => true,
            'variant' => [
                'id' => $variant->id,
                'sku' => 'WEBHOOK-001',
                'name' => 'Default',
                'price' => 199,
                'cost_price' => 99,
                'weight' => 1,
                'stock_quantity' => 5,
                'stock_threshold' => 1,
                'is_active' => true,
            ],
            'attribute_values' => [
                [
                    'attribute_id' => $material->id,
                    'option_id' => $steel->id,
                ],
            ],
        ])
        ->assertSessionHasNoErrors();

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'product.updated'
        && $job->payload['id'] === $product->id
        && is_array($job->payload['paths'] ?? null)
        && in_array('/compare', $job->payload['paths'], true));
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
