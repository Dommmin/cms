<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\BlogPost;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Form;
use App\Models\Page;
use App\Models\Product;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @mixin Page
 */
class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Page $page */
        $page = $this->resource;

        $resolvedForms = $this->resolveEmbeddedForms($page);
        $relationLookup = $this->resolveBlockRelationLookup($page);
        $autoPostsLookup = $this->resolveAutoSourcePosts($page, $relationLookup);

        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'slug_translations' => $page->slug_translations ?? [],
            'is_published' => $page->is_published,
            'page_type' => $page->page_type instanceof BackedEnum ? $page->page_type->value : $page->page_type,
            'module_name' => $page->module_name,
            'module_config' => $page->module_config,
            'content' => $page->content,
            'seo_title' => $page->seo_title,
            'seo_description' => $page->seo_description,
            'seo_canonical' => $page->seo_canonical,
            'meta_robots' => $page->meta_robots ?? 'index, follow',
            'og_image' => $page->og_image,
            'sitemap_exclude' => (bool) $page->sitemap_exclude,
            'sections' => $page->relationLoaded('sections') ? $page->sections->map(fn ($section): array => [
                'id' => $section->id,
                'section_type' => $section->section_type,
                'layout' => $section->layout,
                'variant' => $section->variant,
                'settings' => $section->settings,
                'position' => $section->position,
                'is_active' => (bool) $section->is_active,
                'blocks' => $section->relationLoaded('blocks') ? $section->blocks->map(fn ($block): array => [
                    'id' => $block->id,
                    'type' => $block->type instanceof BackedEnum ? $block->type->value : $block->type,
                    'configuration' => $this->resolveBlockConfiguration($block, $resolvedForms),
                    'position' => $block->position,
                    'is_active' => (bool) $block->is_active,
                    'relations' => $this->buildBlockRelations($block, $relationLookup, $autoPostsLookup),
                    'reusable_block_id' => $block->reusable_block_id,
                ]) : [],
            ]) : [],
        ];
    }

    /**
     * Build the relations array for a single block, handling auto-source blocks.
     *
     * @param  array<string, array<int, array<string, mixed>>>  $relationLookup
     * @param  array<int, array<int, mixed>>  $autoPostsLookup  [block_id => [{...post data...}]]
     * @return array<int, array<string, mixed>>
     */
    private function buildBlockRelations(mixed $block, array $relationLookup, array $autoPostsLookup): array
    {
        $type = $block->type instanceof BackedEnum ? $block->type->value : $block->type;
        $config = $block->configuration ?? [];

        if ($type === 'featured_posts' && ($config['source'] ?? null) === 'latest') {
            $posts = $autoPostsLookup[$block->id] ?? [];

            return array_values(array_map(fn ($post, $pos): array => [
                'id' => 0,
                'relation_type' => 'blog_post',
                'relation_id' => $post['id'],
                'relation_key' => 'posts',
                'position' => $pos,
                'metadata' => null,
                'data' => $post,
            ], $posts, array_keys($posts)));
        }

        if (! $block->relationLoaded('relations')) {
            return [];
        }

        return $block->relations->map(fn ($rel): array => [
            'id' => $rel->id,
            'relation_type' => $rel->relation_type,
            'relation_id' => $rel->relation_id,
            'relation_key' => $rel->relation_key,
            'position' => $rel->position,
            'metadata' => $rel->metadata,
            'data' => $relationLookup[$rel->relation_type][$rel->relation_id] ?? null,
        ])->values()->toArray();
    }

    /**
     * Pre-fetch blog posts for featured_posts blocks with source=latest.
     *
     * Returns [block_id => [post_data, ...]] to avoid N+1 queries.
     *
     * @return array<int, array<int, array<string, mixed>>>
     */
    private function resolveAutoSourcePosts(Page $page, array &$relationLookup): array
    {
        if (! $page->relationLoaded('sections')) {
            return [];
        }

        $autoBlocks = $page->sections
            ->flatMap(fn ($s) => $s->relationLoaded('blocks') ? $s->blocks : collect())
            ->filter(function ($b): bool {
                $type = $b->type instanceof BackedEnum ? $b->type->value : $b->type;

                return $type === 'featured_posts' && ($b->configuration['source'] ?? null) === 'latest';
            });

        if ($autoBlocks->isEmpty()) {
            return [];
        }

        // Find the maximum max_items across all auto-source blocks
        $maxNeeded = $autoBlocks->max(fn ($b): int => (int) ($b->configuration['max_items'] ?? 3));

        $posts = BlogPost::with(['author', 'category'])
            ->published()
            ->orderByDesc('published_at')
            ->limit($maxNeeded)
            ->get();

        $serialized = $posts->map(fn ($post): array => [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'featured_image' => $post->featured_image,
            'published_at' => $post->published_at?->toIso8601String(),
            'reading_time' => $post->reading_time,
            'author' => $post->author ? ['id' => $post->author->id, 'name' => $post->author->name] : null,
            'category' => $post->category ? [
                'id' => $post->category->id,
                'name' => $post->category->name,
                'slug' => $post->category->slug,
            ] : null,
        ])->all();

        // Also populate the relation lookup so resolved data is consistent
        foreach ($posts as $post) {
            $relationLookup['blog_post'][$post->id] = $serialized[array_search($post->id, array_column($serialized, 'id'), true)];
        }

        $result = [];
        foreach ($autoBlocks as $block) {
            $limit = (int) ($block->configuration['max_items'] ?? 3);
            $result[$block->id] = array_slice($serialized, 0, $limit);
        }

        return $result;
    }

    /**
     * Batch-load and resolve all block relations on this page.
     *
     * Returns a lookup indexed by [relation_type][relation_id] => serialized array.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function resolveBlockRelationLookup(Page $page): array
    {
        if (! $page->relationLoaded('sections')) {
            return [];
        }

        $allRelations = $page->sections
            ->flatMap(fn ($s) => $s->relationLoaded('blocks') ? $s->blocks : collect())
            ->flatMap(fn ($b) => $b->relationLoaded('relations') ? $b->relations : collect());

        if ($allRelations->isEmpty()) {
            return [];
        }

        $lookup = [];

        foreach ($allRelations->groupBy('relation_type') as $type => $relations) {
            $ids = $relations->pluck('relation_id')->unique()->values()->toArray();

            if ($type === 'product') {
                $products = Product::with(['thumbnail.media', 'brand', 'category', 'activeVariants:id,product_id,price,compare_at_price'])
                    ->whereIn('id', $ids)->get();

                foreach ($products as $product) {
                    $variants = $product->activeVariants;
                    $prices = $variants->pluck('price');
                    $priceMin = $prices->min() ?? 0;
                    $priceMax = $prices->max() ?? 0;
                    $isOnSale = $variants->some(fn ($v): bool => $v->compare_at_price && $v->compare_at_price > $v->price);
                    $maxDiscount = $variants->map(fn ($v): ?int => $v->compare_at_price && $v->price
                        ? (int) round((1 - $v->price / $v->compare_at_price) * 100)
                        : null
                    )->filter()->max();
                    $cheapestOnSale = $variants
                        ->filter(fn ($v): bool => $v->compare_at_price && $v->compare_at_price > $v->price)
                        ->sortBy('price')
                        ->first();

                    $lookup[$type][$product->id] = [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'short_description' => $product->short_description,
                        'price_min' => $priceMin,
                        'price_max' => $priceMax,
                        'is_active' => $product->is_active,
                        'is_on_sale' => $isOnSale,
                        'discount_percentage' => $maxDiscount ?: null,
                        'compare_at_price_min' => $cheapestOnSale?->compare_at_price,
                        'omnibus_price_min' => null,
                        'variants' => $variants->map(fn ($v): array => [
                            'id' => $v->id,
                            'price' => $v->price,
                            'compare_at_price' => $v->compare_at_price,
                        ])->values()->toArray(),
                        'thumbnail' => $product->thumbnail ? [
                            'url' => $product->thumbnail->media?->getUrl() ?? '',
                            'alt' => $product->thumbnail->media?->name ?? $product->name,
                        ] : null,
                        'brand' => $product->brand ? ['id' => $product->brand->id, 'name' => $product->brand->name] : null,
                        'category' => $product->category ? [
                            'id' => $product->category->id,
                            'name' => $product->category->name,
                            'slug' => $product->category->slug,
                            'image_url' => $product->category->image_path,
                        ] : null,
                        'images' => [],
                        'attributes' => [],
                        'created_at' => $product->created_at->toIso8601String(),
                    ];
                }
            } elseif ($type === 'blog_post') {
                $posts = BlogPost::with(['author', 'category'])->whereIn('id', $ids)->get();

                foreach ($posts as $post) {
                    $lookup[$type][$post->id] = [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'excerpt' => $post->excerpt,
                        'featured_image' => $post->featured_image,
                        'published_at' => $post->published_at?->toIso8601String(),
                        'reading_time' => $post->reading_time,
                        'author' => $post->author ? ['id' => $post->author->id, 'name' => $post->author->name] : null,
                        'category' => $post->category ? [
                            'id' => $post->category->id,
                            'name' => $post->category->name,
                            'slug' => $post->category->slug,
                        ] : null,
                    ];
                }
            } elseif ($type === 'category') {
                $categories = Category::query()->whereIn('id', $ids)->get();

                foreach ($categories as $cat) {
                    $lookup[$type][$cat->id] = [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'description' => $cat->description,
                        'image_url' => $cat->image_path,
                        'parent_id' => $cat->parent_id,
                    ];
                }
            } elseif ($type === 'brand') {
                $brands = Brand::query()->whereIn('id', $ids)->get();

                foreach ($brands as $brand) {
                    $lookup[$type][$brand->id] = [
                        'id' => $brand->id,
                        'name' => $brand->name,
                        'slug' => $brand->slug,
                        'logo_url' => $brand->logo_url ?? null,
                    ];
                }
            }
        }

        return $lookup;
    }

    /**
     * Batch-load all forms referenced by form_embed blocks on this page.
     *
     * @return Collection<int, Form>
     */
    private function resolveEmbeddedForms(Page $page): Collection
    {
        if (! $page->relationLoaded('sections')) {
            return collect();
        }

        $formIds = $page->sections
            ->flatMap(fn ($s) => $s->relationLoaded('blocks') ? $s->blocks : collect())
            ->filter(fn ($b): bool => ($b->type instanceof BackedEnum ? $b->type->value : $b->type) === 'form_embed')
            ->map(fn ($b) => ($b->configuration['form_id'] ?? null))
            ->filter()
            ->unique()
            ->values();

        if ($formIds->isEmpty()) {
            return collect();
        }

        return Form::with('fields')->whereIn('id', $formIds)->get()->keyBy('id');
    }

    /**
     * Merge resolved form data into a form_embed block's configuration.
     *
     * @param  Collection<int, Form>  $resolvedForms
     */
    private function resolveBlockConfiguration(mixed $block, Collection $resolvedForms): array
    {
        $config = $block->configuration ?? [];
        $type = $block->type instanceof BackedEnum ? $block->type->value : $block->type;

        if ($type !== 'form_embed') {
            return $config;
        }

        $formId = $config['form_id'] ?? null;

        if (! $formId || ! $resolvedForms->has($formId)) {
            return $config;
        }

        $form = $resolvedForms->get($formId);

        $config['form'] = [
            'id' => $form->id,
            'name' => $form->name,
            'success_message' => $form->success_message,
            'fields' => $form->fields
                ->sortBy('position')
                ->values()
                ->map(fn ($f): array => [
                    'id' => $f->id,
                    'name' => $f->name,
                    'label' => $f->label,
                    'type' => $f->type instanceof BackedEnum ? $f->type->value : $f->type,
                    'is_required' => (bool) $f->is_required,
                    'placeholder' => ($f->settings['placeholder'] ?? null),
                    'options' => $f->options,
                    'position' => $f->position,
                ])
                ->all(),
        ];

        return $config;
    }
}
