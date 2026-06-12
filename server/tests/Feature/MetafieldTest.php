<?php

declare(strict_types=1);

use App\Jobs\DeliverWebhookJob;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Metafield;
use App\Models\MetafieldDefinition;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\User;
use App\Models\Webhook;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Queue;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function (): void {
    seed([RolePermissionSeeder::class]);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
});

// ── HasMetafields trait ──────────────────────────────────────────────────────

it('can set and get a string metafield on a blog post', function (): void {
    $post = BlogPost::factory()->create();

    $post->setMetafield('seo', 'canonical_url', 'string', 'https://example.com');

    expect($post->getMetafield('seo', 'canonical_url'))->toBe('https://example.com');
});

it('can set and get an integer metafield', function (): void {
    $post = BlogPost::factory()->create();

    $post->setMetafield('specs', 'weight_g', 'integer', 250);

    expect($post->getMetafield('specs', 'weight_g'))->toBe(250);
});

it('can set and get a boolean metafield', function (): void {
    $product = Product::factory()->create();

    $product->setMetafield('details', 'is_organic', 'boolean', true);

    expect($product->getMetafield('details', 'is_organic'))->toBeTrue();
});

it('can set and get a json metafield', function (): void {
    $product = Product::factory()->create();

    $data = ['colors' => ['red', 'blue'], 'sizes' => ['S', 'M']];
    $product->setMetafield('options', 'variants_config', 'json', $data);

    expect($product->getMetafield('options', 'variants_config'))->toBe($data);
});

it('can delete a metafield', function (): void {
    $post = BlogPost::factory()->create();
    $post->setMetafield('seo', 'canonical_url', 'string', 'https://example.com');

    $post->deleteMetafield('seo', 'canonical_url');

    expect($post->getMetafield('seo', 'canonical_url'))->toBeNull();
});

it('can sync metafields including deletions', function (): void {
    $post = BlogPost::factory()->create();
    $post->setMetafield('seo', 'canonical', 'string', 'https://old.com');
    $post->setMetafield('seo', 'robots', 'string', 'noindex');

    $post->syncMetafields([
        ['namespace' => 'seo', 'key' => 'canonical', 'type' => 'string', 'value' => 'https://new.com'],
        ['namespace' => 'seo', 'key' => 'robots', 'type' => 'string', '_delete' => true],
        ['namespace' => 'social', 'key' => 'og_title', 'type' => 'string', 'value' => 'My Post'],
    ]);

    expect($post->getMetafield('seo', 'canonical'))->toBe('https://new.com')
        ->and($post->getMetafield('seo', 'robots'))->toBeNull()
        ->and($post->getMetafield('social', 'og_title'))->toBe('My Post');
});

it('returns metafields grouped by namespace', function (): void {
    $post = BlogPost::factory()->create();
    $post->setMetafield('seo', 'title', 'string', 'SEO Title');
    $post->setMetafield('seo', 'description', 'string', 'SEO Desc');
    $post->setMetafield('social', 'twitter_handle', 'string', '@handle');

    $seoFields = $post->getMetafieldsByNamespace('seo');

    expect($seoFields)->toHaveCount(2);
});

it('returns default value when metafield does not exist', function (): void {
    $post = BlogPost::factory()->create();

    expect($post->getMetafield('missing', 'field', 'fallback'))->toBe('fallback');
});

// ── Metafield model persists correctly ──────────────────────────────────────

it('stores metafields in the database correctly', function (): void {
    $post = BlogPost::factory()->create();
    $post->setMetafield('specs', 'pages', 'integer', 120);

    $this->assertDatabaseHas('metafields', [
        'owner_type' => BlogPost::class,
        'owner_id' => $post->id,
        'namespace' => 'specs',
        'key' => 'pages',
        'type' => 'integer',
        'value' => '120',
    ]);
});

it('updateOrCreate replaces an existing metafield', function (): void {
    $post = BlogPost::factory()->create();
    $post->setMetafield('seo', 'title', 'string', 'First Title');
    $post->setMetafield('seo', 'title', 'string', 'Updated Title');

    expect(Metafield::query()->where('owner_type', BlogPost::class)
        ->where('owner_id', $post->id)
        ->where('namespace', 'seo')
        ->where('key', 'title')
        ->count()
    )->toBe(1);

    expect($post->getMetafield('seo', 'title'))->toBe('Updated Title');
});

// ── MetafieldDefinition model ────────────────────────────────────────────────

it('can create a metafield definition', function (): void {
    $definition = MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'specs',
        'key' => 'weight',
        'name' => 'Weight (g)',
        'type' => 'integer',
        'description' => 'Product weight in grams',
        'pinned' => true,
        'position' => 1,
    ]);

    expect($definition->name)->toBe('Weight (g)')
        ->and($definition->pinned)->toBeTrue();
});

it('forOwnerType scope filters correctly', function (): void {
    MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'specs',
        'key' => 'weight',
        'name' => 'Weight',
        'type' => 'integer',
    ]);
    MetafieldDefinition::query()->create([
        'owner_type' => BlogPost::class,
        'namespace' => 'seo',
        'key' => 'canonical',
        'name' => 'Canonical URL',
        'type' => 'url',
    ]);

    $productDefs = MetafieldDefinition::query()->forOwnerType(Product::class)->get();
    $blogDefs = MetafieldDefinition::query()->forOwnerType(BlogPost::class)->get();

    expect($productDefs)->toHaveCount(1)
        ->and($blogDefs)->toHaveCount(1);
});

// ── API: GET /api/v1/metafields/{type}/{id} ──────────────────────────────────

it('returns only public metafields via public API', function (): void {
    $product = Product::factory()->create();

    MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'specs',
        'key' => 'weight',
        'name' => 'Weight',
        'type' => 'integer',
        'visibility' => 'storefront',
        'storefront_exposed' => false,
    ]);

    MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'internal',
        'key' => 'note',
        'name' => 'Internal note',
        'type' => 'string',
        'visibility' => 'private',
        'storefront_exposed' => false,
    ]);

    MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'internal',
        'key' => 'admin_note',
        'name' => 'Admin note',
        'type' => 'string',
        'visibility' => 'admin_only',
        'storefront_exposed' => false,
    ]);

    $product->syncMetafields([
        ['namespace' => 'specs', 'key' => 'weight', 'type' => 'integer', 'value' => 500],
        ['namespace' => 'internal', 'key' => 'note', 'type' => 'string', 'value' => 'secret'],
        ['namespace' => 'internal', 'key' => 'admin_note', 'type' => 'string', 'value' => 'admin secret'],
    ]);

    $this->getJson('/api/v1/metafields/product/'.$product->id)
        ->assertSuccessful()
        ->assertJsonCount(1)
        ->assertJsonFragment(['namespace' => 'specs', 'key' => 'weight', 'type' => 'integer'])
        ->assertJsonMissing(['namespace' => 'internal', 'key' => 'note'])
        ->assertJsonMissing(['namespace' => 'internal', 'key' => 'admin_note']);
});

it('returns 404 for unknown resource type via API', function (): void {
    $this->getJson('/api/v1/metafields/unknown/1')
        ->assertNotFound();
});

it('returns 404 for nonexistent resource via API', function (): void {
    $this->getJson('/api/v1/metafields/product/999999')
        ->assertNotFound();
});

it('returns casted_value in API response', function (): void {
    $product = Product::factory()->create();
    MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'specs',
        'key' => 'weight',
        'name' => 'Weight',
        'type' => 'integer',
        'visibility' => 'storefront',
        'storefront_exposed' => false,
    ]);
    $product->setMetafield('specs', 'weight', 'integer', 500);

    $this->getJson('/api/v1/metafields/product/'.$product->id)
        ->assertSuccessful()
        ->assertJsonFragment(['casted_value' => 500]);
});

it('returns storefront_exposed metafields even when visibility is admin_only', function (): void {
    $product = Product::factory()->create();

    MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'marketing',
        'key' => 'label',
        'name' => 'Label',
        'type' => 'string',
        'visibility' => 'admin_only',
        'storefront_exposed' => true,
    ]);

    $product->syncMetafields([
        ['namespace' => 'marketing', 'key' => 'label', 'type' => 'string', 'value' => 'Public label'],
    ]);

    $this->getJson('/api/v1/metafields/product/'.$product->id)
        ->assertSuccessful()
        ->assertJsonCount(1)
        ->assertJsonFragment(['namespace' => 'marketing', 'key' => 'label']);
});

// ── Admin: sync metafields ───────────────────────────────────────────────────

it('admin can sync metafields for a blog post', function (): void {
    $post = BlogPost::factory()->create();

    actingAs($this->user)
        ->post(route('admin.metafields.sync', ['type' => 'blog-post', 'id' => $post->id]), [
            'metafields' => [
                ['namespace' => 'seo', 'key' => 'title', 'type' => 'string', 'value' => 'My Title'],
                ['namespace' => 'seo', 'key' => 'robots', 'type' => 'string', 'value' => 'noindex'],
            ],
        ])
        ->assertRedirect();

    expect($post->getMetafield('seo', 'title'))->toBe('My Title');
});

it('admin can save metafields on product, category, page, and blog post forms', function (): void {
    $productType = ProductType::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'product_type_id' => $productType->id,
        'category_id' => $category->id,
    ]);
    $page = Page::factory()->create();
    $post = BlogPost::factory()->draft()->create();

    MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'marketing',
        'key' => 'badge',
        'name' => 'Badge',
        'type' => 'string',
        'visibility' => 'storefront',
        'storefront_exposed' => false,
    ]);
    MetafieldDefinition::query()->create([
        'owner_type' => Category::class,
        'namespace' => 'display',
        'key' => 'subtitle',
        'name' => 'Subtitle',
        'type' => 'string',
        'visibility' => 'admin_only',
        'storefront_exposed' => false,
    ]);
    MetafieldDefinition::query()->create([
        'owner_type' => Page::class,
        'namespace' => 'content',
        'key' => 'note',
        'name' => 'Note',
        'type' => 'rich_text',
        'visibility' => 'admin_only',
        'storefront_exposed' => false,
    ]);
    MetafieldDefinition::query()->create([
        'owner_type' => BlogPost::class,
        'namespace' => 'content',
        'key' => 'badge',
        'name' => 'Badge',
        'type' => 'string',
        'visibility' => 'storefront',
        'storefront_exposed' => false,
    ]);

    actingAs($this->user)
        ->put(route('admin.ecommerce.products.update', $product), [
            'name' => ['en' => 'Extension product'],
            'slug' => ['en' => 'extension-product'],
            'description' => ['en' => 'Description'],
            'short_description' => ['en' => 'Short description'],
            'sku_prefix' => 'EXT',
            'product_type_id' => $productType->id,
            'category_id' => $category->id,
            'brand_id' => null,
            'is_active' => true,
            'is_saleable' => true,
            'is_featured' => false,
            'seo_title' => null,
            'seo_description' => null,
            'variant' => [
                'id' => $product->defaultVariant?->id,
                'sku' => 'EXT-001',
                'price' => 1000,
                'is_active' => true,
            ],
            'categories' => [],
            'flags' => [],
            'images' => [],
            'metafields' => [
                ['namespace' => 'marketing', 'key' => 'badge', 'type' => 'string', 'value' => 'Featured'],
            ],
        ])
        ->assertRedirect();

    actingAs($this->user)
        ->put(route('admin.ecommerce.categories.update', $category), [
            'name' => ['en' => 'Extension category'],
            'slug' => ['en' => 'extension-category'],
            'description' => ['en' => 'Category description'],
            'parent_id' => null,
            'is_active' => true,
            'metafields' => [
                ['namespace' => 'display', 'key' => 'subtitle', 'type' => 'string', 'value' => 'Category subtitle'],
            ],
        ])
        ->assertRedirect();

    actingAs($this->user)
        ->put(route('admin.cms.pages.update', $page), [
            'title' => ['en' => 'Extension page'],
            'slug' => ['en' => 'extension-page'],
            'layout' => 'default',
            'page_type' => 'blocks',
            'module_name' => '',
            'system_page_key' => '',
            'seo_title' => null,
            'seo_description' => null,
            'seo_canonical' => null,
            'metafields' => [
                ['namespace' => 'content', 'key' => 'note', 'type' => 'rich_text', 'value' => '<p>Page note</p>'],
            ],
        ])
        ->assertRedirect();

    actingAs($this->user)
        ->put(route('admin.blog.posts.update', $post), [
            'title' => ['en' => 'Extension post'],
            'slug' => ['en' => 'extension-post'],
            'excerpt' => ['en' => 'Excerpt'],
            'content' => ['en' => 'Post content'],
            'content_json' => ['en' => '{}'],
            'content_type' => 'richtext',
            'status' => 'draft',
            'published_at' => null,
            'blog_category_id' => null,
            'tags' => [],
            'available_locales' => null,
            'is_featured' => false,
            'featured_image' => null,
            'seo_title' => null,
            'seo_description' => null,
            'metafields' => [
                ['namespace' => 'content', 'key' => 'badge', 'type' => 'string', 'value' => 'New'],
            ],
        ])
        ->assertRedirect();

    expect($product->fresh()->getMetafield('marketing', 'badge'))->toBe('Featured')
        ->and($category->fresh()->getMetafield('display', 'subtitle'))->toBe('Category subtitle')
        ->and($page->fresh()->getMetafield('content', 'note'))->toBe('<p>Page note</p>')
        ->and($post->fresh()->getMetafield('content', 'badge'))->toBe('New');
});

it('validates metafield values by type', function (): void {
    $productType = ProductType::factory()->create();
    $category = Category::factory()->create();
    MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'specs',
        'key' => 'weight',
        'name' => 'Weight',
        'type' => 'integer',
        'visibility' => 'admin_only',
        'storefront_exposed' => false,
    ]);

    actingAs($this->user)
        ->post(route('admin.ecommerce.products.store'), [
            'name' => ['en' => 'Validation product'],
            'slug' => ['en' => 'validation-product'],
            'description' => ['en' => 'Description'],
            'short_description' => ['en' => 'Short description'],
            'sku_prefix' => 'VAL',
            'product_type_id' => $productType->id,
            'category_id' => $category->id,
            'brand_id' => null,
            'is_active' => true,
            'is_saleable' => true,
            'is_featured' => false,
            'seo_title' => null,
            'seo_description' => null,
            'variant' => [
                'sku' => 'VAL-001',
                'price' => 1000,
                'is_active' => true,
            ],
            'categories' => [],
            'flags' => [],
            'images' => [],
            'metafields' => [
                ['namespace' => 'specs', 'key' => 'weight', 'type' => 'integer', 'value' => 'not-a-number'],
            ],
        ])
        ->assertSessionHasErrors(['metafields.0.value']);
});

it('dispatches webhook revalidation for public metafield changes', function (): void {
    Queue::fake();

    $product = Product::factory()->create();

    MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'marketing',
        'key' => 'badge',
        'name' => 'Badge',
        'type' => 'string',
        'visibility' => 'storefront',
        'storefront_exposed' => false,
    ]);

    Webhook::factory()->create([
        'events' => ['product.updated'],
        'is_active' => true,
    ]);

    $product->syncMetafields([
        ['namespace' => 'marketing', 'key' => 'badge', 'type' => 'string', 'value' => 'Featured'],
    ]);

    Queue::assertPushed(DeliverWebhookJob::class, fn (DeliverWebhookJob $job): bool => $job->event === 'product.updated');
});

// ── Admin: MetafieldDefinition CRUD ─────────────────────────────────────────

it('admin can list metafield definitions', function (): void {
    actingAs($this->user)
        ->get(route('admin.metafield-definitions.index'))
        ->assertSuccessful();
});

it('admin can create a metafield definition', function (): void {
    actingAs($this->user)
        ->post(route('admin.metafield-definitions.store'), [
            'owner_type' => Product::class,
            'namespace' => 'specs',
            'key' => 'material',
            'name' => 'Material',
            'type' => 'string',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('metafield_definitions', [
        'owner_type' => Product::class,
        'namespace' => 'specs',
        'key' => 'material',
    ]);
});

it('admin can update a metafield definition', function (): void {
    $definition = MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'specs',
        'key' => 'color',
        'name' => 'Color',
        'type' => 'string',
    ]);

    actingAs($this->user)
        ->put(route('admin.metafield-definitions.update', $definition), [
            'owner_type' => Product::class,
            'namespace' => 'specs',
            'key' => 'color',
            'name' => 'Primary Color',
            'type' => 'color',
        ])
        ->assertRedirect();

    expect($definition->fresh()->name)->toBe('Primary Color')
        ->and($definition->fresh()->type)->toBe('color');
});

it('admin can delete a metafield definition', function (): void {
    $definition = MetafieldDefinition::query()->create([
        'owner_type' => Product::class,
        'namespace' => 'specs',
        'key' => 'size',
        'name' => 'Size',
        'type' => 'string',
    ]);

    actingAs($this->user)
        ->delete(route('admin.metafield-definitions.destroy', $definition))
        ->assertRedirect();

    $this->assertDatabaseMissing('metafield_definitions', ['id' => $definition->id]);
});

it('validates namespace and key format on create', function (): void {
    actingAs($this->user)
        ->post(route('admin.metafield-definitions.store'), [
            'owner_type' => Product::class,
            'namespace' => 'Invalid Namespace!',
            'key' => 'Invalid Key!',
            'name' => 'Test',
            'type' => 'string',
        ])
        ->assertSessionHasErrors(['namespace', 'key']);
});
