<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\MetafieldDefinition;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DemoMetafieldSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDefinitions();
        $this->seedProductMetafields();
        $this->seedCategoryMetafields();
        $this->seedPageMetafields();
        $this->seedBlogPostMetafields();
    }

    private function seedDefinitions(): void
    {
        foreach ($this->definitions() as $definition) {
            MetafieldDefinition::query()->updateOrCreate(
                [
                    'owner_type' => $definition['owner_type'],
                    'namespace' => $definition['namespace'],
                    'key' => $definition['key'],
                ],
                $definition,
            );
        }
    }

    private function seedProductMetafields(): void
    {
        $products = [
            'vitamin-c-serum' => [
                ['namespace' => 'content', 'key' => 'product_story', 'type' => 'rich_text', 'value' => '<p>Developed for brightening routines that need glow without sting.</p>'],
                ['namespace' => 'content', 'key' => 'care_instructions', 'type' => 'rich_text', 'value' => '<p>Apply on dry skin, follow with moisturiser, and store away from direct sunlight.</p>'],
                ['namespace' => 'files', 'key' => 'specification_pdf', 'type' => 'url', 'value' => '/demo/specifications/product-specification.pdf'],
                ['namespace' => 'badges', 'key' => 'custom_badge_text', 'type' => 'string', 'value' => 'Editor pick'],
                ['namespace' => 'erp', 'key' => 'internal_note', 'type' => 'string', 'value' => 'Priority replenishment'],
                ['namespace' => 'erp', 'key' => 'external_id', 'type' => 'string', 'value' => 'ERP-SERUM-001'],
                ['namespace' => 'logistics', 'key' => 'pick_pack_note', 'type' => 'string', 'value' => 'Glass bottle - keep upright'],
            ],
            'usb-c-30w-charger' => [
                ['namespace' => 'content', 'key' => 'product_story', 'type' => 'rich_text', 'value' => '<p>Designed for a single-bag travel setup with one reliable charger.</p>'],
                ['namespace' => 'content', 'key' => 'care_instructions', 'type' => 'rich_text', 'value' => '<p>Use with certified USB-C cables and avoid covering the charger while in use.</p>'],
                ['namespace' => 'files', 'key' => 'specification_pdf', 'type' => 'url', 'value' => '/demo/specifications/product-specification.pdf'],
                ['namespace' => 'badges', 'key' => 'custom_badge_text', 'type' => 'string', 'value' => 'Travel ready'],
                ['namespace' => 'erp', 'key' => 'internal_note', 'type' => 'string', 'value' => 'Bundle with cable accessory'],
                ['namespace' => 'erp', 'key' => 'external_id', 'type' => 'string', 'value' => 'ERP-CHARGER-030'],
                ['namespace' => 'logistics', 'key' => 'pick_pack_note', 'type' => 'string', 'value' => 'Keep adapter box intact'],
            ],
            'wireless-headphones' => [
                ['namespace' => 'content', 'key' => 'product_story', 'type' => 'rich_text', 'value' => '<p>Tuned for commuting with fast switching between calls and music.</p>'],
                ['namespace' => 'content', 'key' => 'care_instructions', 'type' => 'rich_text', 'value' => '<p>Wipe ear pads dry after workouts and recharge before long storage.</p>'],
                ['namespace' => 'files', 'key' => 'specification_pdf', 'type' => 'url', 'value' => '/demo/specifications/product-specification.pdf'],
                ['namespace' => 'badges', 'key' => 'custom_badge_text', 'type' => 'string', 'value' => 'ANC ready'],
                ['namespace' => 'erp', 'key' => 'internal_note', 'type' => 'string', 'value' => 'Pair with travel campaign'],
                ['namespace' => 'erp', 'key' => 'external_id', 'type' => 'string', 'value' => 'ERP-HP-220'],
                ['namespace' => 'logistics', 'key' => 'pick_pack_note', 'type' => 'string', 'value' => 'Fold before packing'],
            ],
        ];

        foreach ($products as $slug => $metafields) {
            $product = Product::query()->where('slug->en', $slug)->first();

            if (! $product instanceof Product) {
                continue;
            }

            $product->syncMetafields($metafields);
        }
    }

    private function seedCategoryMetafields(): void
    {
        $categories = [
            'face-creams' => [
                ['namespace' => 'content', 'key' => 'buying_guide', 'type' => 'rich_text', 'value' => '<p>Compare texture, barrier support, and SPF before deciding.</p>'],
                ['namespace' => 'seo', 'key' => 'extra_intro', 'type' => 'string', 'value' => 'Face creams for dry, sensitive, and daily barrier care.'],
                ['namespace' => 'merchandising', 'key' => 'priority_note', 'type' => 'string', 'value' => 'Push in skincare landing page'],
            ],
            'smartphones' => [
                ['namespace' => 'content', 'key' => 'buying_guide', 'type' => 'rich_text', 'value' => '<p>Use screen size, storage, and charging ecosystem as your first three filters.</p>'],
                ['namespace' => 'seo', 'key' => 'extra_intro', 'type' => 'string', 'value' => 'Smartphones with clear differences in storage, charging, and accessories.'],
                ['namespace' => 'merchandising', 'key' => 'priority_note', 'type' => 'string', 'value' => 'Highlight flagship devices'],
            ],
        ];

        foreach ($categories as $slug => $metafields) {
            $category = Category::query()->where('slug->en', $slug)->first();

            if (! $category instanceof Category) {
                continue;
            }

            $category->syncMetafields($metafields);
        }
    }

    private function seedPageMetafields(): void
    {
        $pages = [
            'home' => [
                ['namespace' => 'layout', 'key' => 'custom_section_hint', 'type' => 'string', 'value' => 'Feature demo catalog modules above the fold'],
                ['namespace' => 'content', 'key' => 'hero_subtitle', 'type' => 'string', 'value' => 'End-to-end demo catalog with content, variants, and metafields'],
                ['namespace' => 'admin', 'key' => 'editor_note', 'type' => 'string', 'value' => 'Keep this page aligned with demo seed data'],
            ],
            'blog' => [
                ['namespace' => 'layout', 'key' => 'custom_section_hint', 'type' => 'string', 'value' => 'Keep editorial listing compact on mobile'],
                ['namespace' => 'content', 'key' => 'hero_subtitle', 'type' => 'string', 'value' => 'Stories, guides, and product education powered by the default blog'],
                ['namespace' => 'admin', 'key' => 'editor_note', 'type' => 'string', 'value' => 'Draft posts should remain hidden on storefront'],
            ],
        ];

        foreach ($pages as $slug => $metafields) {
            $page = Page::query()->where('slug->en', $slug)->whereNull('locale')->first();

            if (! $page instanceof Page) {
                continue;
            }

            $page->syncMetafields($metafields);
        }
    }

    private function seedBlogPostMetafields(): void
    {
        $posts = [
            'how-to-layer-vitamin-c' => [
                ['namespace' => 'content', 'key' => 'reading_time', 'type' => 'integer', 'value' => 4],
                ['namespace' => 'content', 'key' => 'source_url', 'type' => 'url', 'value' => 'https://example.test/editorial/vitamin-c'],
                ['namespace' => 'admin', 'key' => 'editor_note', 'type' => 'string', 'value' => 'Repurpose in skincare campaign'],
            ],
            'what-fast-charging-really-means' => [
                ['namespace' => 'content', 'key' => 'reading_time', 'type' => 'integer', 'value' => 5],
                ['namespace' => 'content', 'key' => 'source_url', 'type' => 'url', 'value' => 'https://example.test/editorial/fast-charging'],
                ['namespace' => 'admin', 'key' => 'editor_note', 'type' => 'string', 'value' => 'Update after charger assortment refresh'],
            ],
        ];

        foreach ($posts as $slug => $metafields) {
            $post = BlogPost::query()->where('slug->en', $slug)->first();

            if (! $post instanceof BlogPost) {
                continue;
            }

            $post->syncMetafields($metafields);
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function definitions(): array
    {
        return [
            $this->definition(Product::class, 'content', 'product_story', 'Product Story', 'rich_text', 'storefront', false, 1),
            $this->definition(Product::class, 'content', 'care_instructions', 'Care Instructions', 'rich_text', 'storefront', false, 2),
            $this->definition(Product::class, 'files', 'specification_pdf', 'Specification PDF', 'url', 'storefront', false, 3),
            $this->definition(Product::class, 'badges', 'custom_badge_text', 'Custom Badge Text', 'string', 'storefront', false, 4),
            $this->definition(Product::class, 'erp', 'internal_note', 'Internal Note', 'string', 'admin_only', false, 10),
            $this->definition(Product::class, 'erp', 'external_id', 'External ID', 'string', 'admin_only', false, 11),
            $this->definition(Product::class, 'logistics', 'pick_pack_note', 'Pick Pack Note', 'string', 'admin_only', false, 12),
            $this->definition(Category::class, 'content', 'buying_guide', 'Buying Guide', 'rich_text', 'storefront', false, 1),
            $this->definition(Category::class, 'seo', 'extra_intro', 'Extra Intro', 'string', 'storefront', false, 2),
            $this->definition(Category::class, 'merchandising', 'priority_note', 'Priority Note', 'string', 'admin_only', false, 10),
            $this->definition(Page::class, 'layout', 'custom_section_hint', 'Custom Section Hint', 'string', 'storefront', false, 1),
            $this->definition(Page::class, 'content', 'hero_subtitle', 'Hero Subtitle', 'string', 'storefront', false, 2),
            $this->definition(Page::class, 'admin', 'editor_note', 'Editor Note', 'string', 'admin_only', false, 10),
            $this->definition(BlogPost::class, 'content', 'reading_time', 'Reading Time', 'integer', 'storefront', false, 1),
            $this->definition(BlogPost::class, 'content', 'source_url', 'Source URL', 'url', 'storefront', false, 2),
            $this->definition(BlogPost::class, 'admin', 'editor_note', 'Editor Note', 'string', 'admin_only', false, 10),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function definition(
        string $ownerType,
        string $namespace,
        string $key,
        string $name,
        string $type,
        string $visibility,
        bool $storefrontExposed,
        int $position,
    ): array {
        return [
            'owner_type' => $ownerType,
            'namespace' => $namespace,
            'key' => $key,
            'name' => $name,
            'type' => $type,
            'visibility' => $visibility,
            'storefront_exposed' => $storefrontExposed,
            'description' => $name.' demo field',
            'pinned' => $position <= 4,
            'position' => $position,
        ];
    }
}
