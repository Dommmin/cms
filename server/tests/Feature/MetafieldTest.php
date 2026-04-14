<?php

declare(strict_types=1);

use App\Models\BlogPost;
use App\Models\Metafield;
use App\Models\MetafieldDefinition;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

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
        'owner_type' => 'App\Models\Product',
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
        'owner_type' => 'App\Models\Product',
        'namespace' => 'specs',
        'key' => 'weight',
        'name' => 'Weight',
        'type' => 'integer',
    ]);
    MetafieldDefinition::query()->create([
        'owner_type' => 'App\Models\BlogPost',
        'namespace' => 'seo',
        'key' => 'canonical',
        'name' => 'Canonical URL',
        'type' => 'url',
    ]);

    $productDefs = MetafieldDefinition::query()->forOwnerType('App\Models\Product')->get();
    $blogDefs = MetafieldDefinition::query()->forOwnerType('App\Models\BlogPost')->get();

    expect($productDefs)->toHaveCount(1)
        ->and($blogDefs)->toHaveCount(1);
});

// ── API: GET /api/v1/metafields/{type}/{id} ──────────────────────────────────

it('returns metafields via public API', function (): void {
    $product = Product::factory()->create();
    $product->setMetafield('specs', 'weight', 'integer', 500);
    $product->setMetafield('specs', 'color', 'string', 'blue');

    $this->getJson("/api/v1/metafields/product/{$product->id}")
        ->assertSuccessful()
        ->assertJsonCount(2)
        ->assertJsonFragment(['namespace' => 'specs', 'key' => 'weight', 'type' => 'integer']);
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
    $product->setMetafield('specs', 'weight', 'integer', 500);

    $this->getJson("/api/v1/metafields/product/{$product->id}")
        ->assertSuccessful()
        ->assertJsonFragment(['casted_value' => 500]);
});

// ── Admin: sync metafields ───────────────────────────────────────────────────

it('admin can sync metafields for a blog post', function (): void {
    $post = BlogPost::factory()->create();

    actingAs($this->user)
        ->post("/admin/metafields/blog-post/{$post->id}/sync", [
            'metafields' => [
                ['namespace' => 'seo', 'key' => 'title', 'type' => 'string', 'value' => 'My Title'],
                ['namespace' => 'seo', 'key' => 'robots', 'type' => 'string', 'value' => 'noindex'],
            ],
        ])
        ->assertRedirect();

    expect($post->getMetafield('seo', 'title'))->toBe('My Title');
});

// ── Admin: MetafieldDefinition CRUD ─────────────────────────────────────────

it('admin can list metafield definitions', function (): void {
    actingAs($this->user)
        ->get('/admin/metafield-definitions')
        ->assertSuccessful();
});

it('admin can create a metafield definition', function (): void {
    actingAs($this->user)
        ->post('/admin/metafield-definitions', [
            'owner_type' => 'App\Models\Product',
            'namespace' => 'specs',
            'key' => 'material',
            'name' => 'Material',
            'type' => 'string',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('metafield_definitions', [
        'owner_type' => 'App\Models\Product',
        'namespace' => 'specs',
        'key' => 'material',
    ]);
});

it('admin can update a metafield definition', function (): void {
    $definition = MetafieldDefinition::query()->create([
        'owner_type' => 'App\Models\Product',
        'namespace' => 'specs',
        'key' => 'color',
        'name' => 'Color',
        'type' => 'string',
    ]);

    actingAs($this->user)
        ->put("/admin/metafield-definitions/{$definition->id}", [
            'owner_type' => 'App\Models\Product',
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
        'owner_type' => 'App\Models\Product',
        'namespace' => 'specs',
        'key' => 'size',
        'name' => 'Size',
        'type' => 'string',
    ]);

    actingAs($this->user)
        ->delete("/admin/metafield-definitions/{$definition->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('metafield_definitions', ['id' => $definition->id]);
});

it('validates namespace and key format on create', function (): void {
    actingAs($this->user)
        ->post('/admin/metafield-definitions', [
            'owner_type' => 'App\Models\Product',
            'namespace' => 'Invalid Namespace!',
            'key' => 'Invalid Key!',
            'name' => 'Test',
            'type' => 'string',
        ])
        ->assertSessionHasErrors(['namespace', 'key']);
});
