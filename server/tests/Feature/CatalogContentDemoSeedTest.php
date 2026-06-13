<?php

declare(strict_types=1);

use App\Enums\BlogPostStatusEnum;
use App\Models\Blog;
use App\Models\BlogPost;
use App\Models\MetafieldDefinition;
use App\Models\Page;
use App\Models\Product;
use Database\Seeders\DatabaseSeeder;

use function Pest\Laravel\seed;

it('seeds the final catalog content demo dataset', function (): void {
    seed(DatabaseSeeder::class);

    expect(Blog::query()->where('slug->en', 'blog')->count())->toBe(1)
        ->and(Product::query()->count())->toBe(246)
        ->and(BlogPost::query()->count())->toBe(6)
        ->and(BlogPost::query()->where('status', BlogPostStatusEnum::Draft)->count())->toBe(1)
        ->and(Page::query()->whereIn('system_page_key', [
            'blog_listing',
            'product_listing',
            'category_listing',
            'brand_listing',
            'privacy_policy',
            'terms_of_service',
        ])->count())->toBeGreaterThanOrEqual(6)
        ->and(MetafieldDefinition::query()->count())->toBe(16);
});

it('is idempotent when the demo seed pack is run twice', function (): void {
    seed(DatabaseSeeder::class);
    seed(DatabaseSeeder::class);

    expect(Product::query()->whereIn('slug->en', [
        'vitamin-c-serum',
        'usb-c-30w-charger',
        'cotton-shopping-bag',
        'hydrating-face-cream',
        'basic-t-shirt',
        'wireless-headphones',
        'radiant-serum-001',
        'power-dock-001',
        'daily-tee-001',
    ])->count())->toBe(9)
        ->and(Product::query()->count())->toBe(246)
        ->and(BlogPost::query()->whereIn('slug->en', [
            'how-to-layer-vitamin-c',
            'what-fast-charging-really-means',
            'cotton-weights-explained',
            'how-to-choose-noise-cancelling-headphones',
            'inside-the-summer-content-calendar',
            'spf-textures-for-sensitive-skin',
        ])->count())->toBe(6)
        ->and(MetafieldDefinition::query()->count())->toBe(16);
});

it('seeds demo products with required attributes and valid variants', function (): void {
    seed(DatabaseSeeder::class);

    $cream = Product::query()
        ->where('slug->en', 'hydrating-face-cream')
        ->with(['attributeValues.attribute', 'variants.attributeValues.attribute', 'variants.attributeValues.attributeValue'])
        ->firstOrFail();

    $charger = Product::query()
        ->where('slug->en', 'usb-c-30w-charger')
        ->with(['attributeValues.attribute', 'defaultVariant'])
        ->firstOrFail();

    expect($cream->attributeValues->pluck('attribute.slug')->all())
        ->toContain('skin_type', 'active_ingredients', 'spf', 'vegan', 'country_of_origin')
        ->and($cream->variants)->toHaveCount(3)
        ->and($cream->defaultVariant?->sku)->toBe('DL-CREAM-50')
        ->and($cream->variants->every(fn ($variant): bool => $variant->attributeValues->isNotEmpty()))->toBeTrue()
        ->and($charger->defaultVariant?->sku)->toBe('VT-CHG-30W')
        ->and($charger->variants)->toHaveCount(1);
});

it('keeps product detail and public metafield contracts intact for demo data', function (): void {
    seed(DatabaseSeeder::class);

    $product = Product::query()->where('slug->en', 'wireless-headphones')->firstOrFail();

    $this->getJson('/api/v1/products/wireless-headphones')
        ->assertOk()
        ->assertJsonStructure([
            'attribute_values',
            'attribute_summary',
            'variant_options',
            'variants',
            'category',
            'brand',
            'images',
        ])
        ->assertJsonFragment(['slug' => 'wireless'])
        ->assertJsonFragment(['slug' => 'edition'])
        ->assertJsonMissing(['key' => 'internal_note'])
        ->assertJsonMissing(['key' => 'external_id']);

    $this->getJson('/api/v1/metafields/product/'.$product->id)
        ->assertOk()
        ->assertJsonFragment(['namespace' => 'content', 'key' => 'product_story'])
        ->assertJsonFragment(['namespace' => 'badges', 'key' => 'custom_badge_text'])
        ->assertJsonMissing(['namespace' => 'erp', 'key' => 'internal_note'])
        ->assertJsonMissing(['namespace' => 'logistics', 'key' => 'pick_pack_note']);

    $this->getJson('/api/v1/products?filter[name]='.rawurlencode('Radiant Serum 001'))
        ->assertOk()
        ->assertJsonFragment(['slug' => 'radiant-serum-001']);
});

it('shows only published blog posts and keeps seeded system pages available', function (): void {
    seed(DatabaseSeeder::class);

    $draft = BlogPost::query()->where('slug->en', 'inside-the-summer-content-calendar')->firstOrFail();
    $published = BlogPost::query()->where('slug->en', 'how-to-layer-vitamin-c')->firstOrFail();
    $page = Page::query()->where('system_page_key', 'blog_listing')->whereNull('locale')->firstOrFail();

    $this->getJson('/api/v1/blog/posts')
        ->assertOk()
        ->assertJsonFragment(['slug' => 'how-to-layer-vitamin-c'])
        ->assertJsonMissing(['slug' => 'inside-the-summer-content-calendar']);

    $this->getJson('/api/v1/metafields/blog-post/'.$published->id)
        ->assertOk()
        ->assertJsonFragment(['namespace' => 'content', 'key' => 'source_url'])
        ->assertJsonMissing(['namespace' => 'admin', 'key' => 'editor_note']);

    $this->getJson('/api/v1/metafields/page/'.$page->id)
        ->assertOk()
        ->assertJsonFragment(['namespace' => 'content', 'key' => 'hero_subtitle'])
        ->assertJsonMissing(['namespace' => 'admin', 'key' => 'editor_note']);

    $this->getJson('/api/v1/pages/system/blog_listing')
        ->assertOk()
        ->assertJsonPath('system_page_key', 'blog_listing');

    expect($draft->status)->toBe(BlogPostStatusEnum::Draft);
});
