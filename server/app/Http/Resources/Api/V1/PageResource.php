<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\BlogPost;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Form;
use App\Models\Page;
use App\Models\Product;
use App\Models\Store;
use App\Services\Hooks\Cms\PageRenderFilter;
use App\Services\Hooks\Facades\Hook;
use App\Services\MetafieldVisibilityService;
use App\Services\PageBuilder\PageRenderContext;
use App\Services\StorefrontPathService;
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
        $autoProductsLookup = $this->resolveAutoSourceFeaturedProducts($page, $relationLookup);
        $autoStoresLookup = $this->resolveMapBlockStores($page, $relationLookup);
        $autoBrandsLookup = $this->resolveAutoSourceBrands($page, $relationLookup);
        $locale = app()->getLocale();

        $seo = $page->getSeoMetadata();

        $data = [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->getTranslation('slug', $locale, false),
            'path' => resolve(StorefrontPathService::class)->pagePath($page, $locale),
            'is_published' => $page->is_published,
            'page_type' => $page->page_type->value,
            'module_name' => $page->module_name,
            'system_page_key' => $page->system_page_key,
            'module_config' => $page->module_config,
            'content' => $page->content,
            'seo_title' => $seo['title'],
            'seo_description' => $seo['description'],
            'seo_canonical' => $seo['canonical'],
            'meta_robots' => $seo['robots'],
            'og_image' => $seo['og_image'],
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
                    'type' => $block->type->value,
                    'configuration' => $this->resolveBlockConfiguration($block, $resolvedForms),
                    'position' => $block->position,
                    'is_active' => (bool) $block->is_active,
                    'relations' => $this->buildBlockRelations(
                        $block,
                        $relationLookup,
                        $autoPostsLookup,
                        $autoProductsLookup,
                        $autoStoresLookup,
                        $autoBrandsLookup,
                    ),
                    'reusable_block_id' => $block->reusable_block_id,
                ]) : [],
            ]) : [],
        ];

        if ($page->relationLoaded('metafields')) {
            $data['metafields'] = MetafieldResource::collection(
                resolve(MetafieldVisibilityService::class)->publicMetafieldsForOwner($page)
            )->resolve($request);
        }

        $filter = Hook::filter(new PageRenderFilter($data, $page));

        return $filter->pageData;
    }

    /**
     * Build the relations array for a single block, handling auto-source blocks.
     *
     * @param  array<string, array<int, array<string, mixed>>>  $relationLookup
     * @param  array<int, array<int, mixed>>  $autoPostsLookup  [block_id => [{...post data...}]]
     * @param  array<int, array<int, mixed>>  $autoProductsLookup  [block_id => [{...product data...}]]
     * @param  array<int, array<int, mixed>>  $autoStoresLookup  [block_id => [{...store data...}]]
     * @param  array<int, array<int, mixed>>  $autoBrandsLookup  [block_id => [{...brand data...}]]
     * @return array<int, array<string, mixed>>
     */
    private function buildBlockRelations(
        mixed $block,
        array $relationLookup,
        array $autoPostsLookup,
        array $autoProductsLookup,
        array $autoStoresLookup,
        array $autoBrandsLookup,
    ): array {
        $type = $block->type instanceof BackedEnum ? $block->type->value : $block->type;
        $config = $block->configuration ?? [];

        if ($type === 'map' && ! empty($config['store_id'])) {
            $stores = $autoStoresLookup[$block->id] ?? [];

            return array_map(fn ($store, $pos): array => [
                'id' => 0,
                'relation_type' => 'store',
                'relation_id' => $store['id'],
                'relation_key' => 'location',
                'position' => $pos,
                'metadata' => null,
                'data' => $store,
            ], $stores, array_keys($stores));
        }

        if ($type === 'brands_slider' && ($config['source'] ?? 'all') !== 'manual') {
            $brands = $autoBrandsLookup[$block->id] ?? [];

            return array_map(fn ($brand, $pos): array => [
                'id' => 0,
                'relation_type' => 'brand',
                'relation_id' => $brand['id'],
                'relation_key' => 'brands',
                'position' => $pos,
                'metadata' => null,
                'data' => $brand,
            ], $brands, array_keys($brands));
        }

        if ($type === 'featured_posts' && ($config['source'] ?? null) === 'latest') {
            $posts = $autoPostsLookup[$block->id] ?? [];

            return array_map(fn ($post, $pos): array => [
                'id' => 0,
                'relation_type' => 'blog_post',
                'relation_id' => $post['id'],
                'relation_key' => 'posts',
                'position' => $pos,
                'metadata' => null,
                'data' => $post,
            ], $posts, array_keys($posts));
        }

        if ($type === 'featured_products' && ($config['filter_mode'] ?? 'manual') === 'featured') {
            $products = $autoProductsLookup[$block->id] ?? [];

            return array_map(fn ($product, $pos): array => [
                'id' => 0,
                'relation_type' => 'product',
                'relation_id' => $product['id'],
                'relation_key' => 'products',
                'position' => $pos,
                'metadata' => null,
                'data' => $product,
            ], $products, array_keys($products));
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

        $pathService = resolve(StorefrontPathService::class);
        $serialized = $posts->map(fn ($post): array => [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'public_url' => $pathService->blogPostPath($post),
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
     * Pre-fetch stores for map blocks with store_id in configuration.
     *
     * @return array<int, array<int, array<string, mixed>>>
     */
    private function resolveMapBlockStores(Page $page, array &$relationLookup): array
    {
        if (! $page->relationLoaded('sections')) {
            return [];
        }

        $mapBlocks = $page->sections
            ->flatMap(fn ($s) => $s->relationLoaded('blocks') ? $s->blocks : collect())
            ->filter(function ($b): bool {
                $type = $b->type instanceof BackedEnum ? $b->type->value : $b->type;

                return $type === 'map' && ! empty($b->configuration['store_id']);
            });

        if ($mapBlocks->isEmpty()) {
            return [];
        }

        $storeIds = $mapBlocks
            ->map(fn ($b): int => (int) $b->configuration['store_id'])
            ->unique()
            ->values()
            ->all();

        $stores = Store::query()
            ->active()
            ->whereIn('id', $storeIds)
            ->get()
            ->keyBy('id');

        foreach ($stores as $store) {
            $relationLookup['store'][$store->id] = $this->serializeStoreForBlock($store);
        }

        $result = [];
        foreach ($mapBlocks as $block) {
            $storeId = (int) $block->configuration['store_id'];
            $store = $stores->get($storeId);

            if ($store instanceof Store) {
                $result[$block->id] = [$this->serializeStoreForBlock($store)];
            }
        }

        return $result;
    }

    /**
     * Pre-fetch brands for brands_slider blocks with source=all (default).
     *
     * @return array<int, array<int, array<string, mixed>>>
     */
    private function resolveAutoSourceBrands(Page $page, array &$relationLookup): array
    {
        if (! config('modules.ecommerce') || ! $page->relationLoaded('sections')) {
            return [];
        }

        $autoBlocks = $page->sections
            ->flatMap(fn ($s) => $s->relationLoaded('blocks') ? $s->blocks : collect())
            ->filter(function ($b): bool {
                $type = $b->type instanceof BackedEnum ? $b->type->value : $b->type;

                return $type === 'brands_slider'
                    && ($b->configuration['source'] ?? 'all') !== 'manual';
            });

        if ($autoBlocks->isEmpty()) {
            return [];
        }

        $pathService = resolve(StorefrontPathService::class);
        $brands = Brand::query()
            ->where('is_active', true)
            ->orderBy('position')
            ->orderBy('name')
            ->limit(50)
            ->get();

        $serialized = $brands
            ->map(fn (Brand $brand): array => $this->serializeBrandForBlock($brand, $pathService))
            ->all();

        foreach ($serialized as $brandData) {
            $relationLookup['brand'][$brandData['id']] = $brandData;
        }

        $result = [];
        foreach ($autoBlocks as $block) {
            $result[$block->id] = $serialized;
        }

        return $result;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeBrandForBlock(Brand $brand, StorefrontPathService $pathService): array
    {
        return [
            'id' => $brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'logo_url' => $brand->logo_path,
            'public_url' => $pathService->brandPath($brand),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeStoreForBlock(Store $store): array
    {
        return [
            'id' => $store->id,
            'name' => $store->name,
            'slug' => $store->slug,
            'address' => $store->address,
            'city' => $store->city,
            'country' => $store->country,
            'phone' => $store->phone,
            'email' => $store->email,
            'opening_hours' => $store->opening_hours,
            'lat' => (float) $store->lat,
            'lng' => (float) $store->lng,
        ];
    }

    /**
     * Pre-fetch products for featured_products blocks with filter_mode=featured.
     *
     * Returns [block_id => [product_data, ...]] to avoid N+1 queries.
     *
     * @return array<int, array<int, array<string, mixed>>>
     */
    private function resolveAutoSourceFeaturedProducts(Page $page, array &$relationLookup): array
    {
        if (! config('modules.ecommerce') || ! $page->relationLoaded('sections')) {
            return [];
        }

        $autoBlocks = $page->sections
            ->flatMap(fn ($s) => $s->relationLoaded('blocks') ? $s->blocks : collect())
            ->filter(function ($b): bool {
                $type = $b->type instanceof BackedEnum ? $b->type->value : $b->type;

                return $type === 'featured_products'
                    && ($b->configuration['filter_mode'] ?? 'manual') === 'featured';
            });

        if ($autoBlocks->isEmpty()) {
            return [];
        }

        $context = app()->bound(PageRenderContext::class)
            ? app(PageRenderContext::class)
            : new PageRenderContext();

        $pathService = resolve(StorefrontPathService::class);
        $result = [];

        foreach ($autoBlocks as $block) {
            $categoryId = $this->resolveFeaturedProductsCategoryId($block, $context);
            $limit = (int) ($block->configuration['max_items'] ?? 8);

            $products = Product::available()
                ->where('is_featured', true)
                ->when($categoryId !== null, fn ($query) => $query->where('category_id', $categoryId))
                ->with($this->blockProductEagerLoads())
                ->orderBy('name')
                ->limit($limit)
                ->get();

            $serialized = $products
                ->map(fn (Product $product): array => $this->serializeProductForBlock($product, $pathService))
                ->all();

            foreach ($serialized as $productData) {
                $relationLookup['product'][$productData['id']] = $productData;
            }

            $result[$block->id] = $serialized;
        }

        return $result;
    }

    private function resolveFeaturedProductsCategoryId(mixed $block, PageRenderContext $context): ?int
    {
        if ($block->relationLoaded('relations')) {
            $categoryFilter = $block->relations->firstWhere('relation_key', 'category_filter');

            if ($categoryFilter !== null) {
                return (int) $categoryFilter->relation_id;
            }
        }

        return $context->currentCategoryId;
    }

    /**
     * @return list<string>
     */
    private function blockProductEagerLoads(): array
    {
        return [
            'thumbnail.media',
            'brand',
            'category',
            'activeVariants:id,product_id,price,compare_at_price,stock_quantity,is_active,backorder_allowed',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeProductForBlock(Product $product, StorefrontPathService $pathService): array
    {
        $variants = $product->activeVariants;
        $prices = $variants->pluck('price');
        $priceMin = $prices->min() ?? 0;
        $priceMax = $prices->max() ?? 0;
        $isOnSale = $variants->contains(fn ($v): bool => $v->compare_at_price && $v->compare_at_price > $v->price);
        $maxDiscount = $variants->map(fn ($v): ?int => $v->compare_at_price && $v->price
            ? (int) round((1 - $v->price / $v->compare_at_price) * 100)
            : null
        )->filter()->max();
        $cheapestOnSale = $variants
            ->filter(fn ($v): bool => $v->compare_at_price && $v->compare_at_price > $v->price)
            ->sortBy('price')
            ->first();

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'public_url' => $pathService->productPath($product),
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
            ])->values()->all(),
            'thumbnail' => ($thumbnail = $product->thumbnail) && ($media = $thumbnail->media) ? [
                'url' => $media->getUrl(),
                'alt' => $media->name ?: $product->name,
            ] : null,
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
                'public_url' => $pathService->brandPath($product->brand),
            ] : null,
            'category' => [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
                'image_url' => $product->category->image_path,
                'public_url' => $pathService->categoryPath($product->category),
            ],
            'images' => [],
            'attributes' => [],
            'created_at' => $product->created_at->toIso8601String(),
        ];
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
        $pathService = resolve(StorefrontPathService::class);

        foreach ($allRelations->groupBy('relation_type') as $type => $relations) {
            $ids = $relations->pluck('relation_id')->unique()->values()->toArray();

            if ($type === 'product' && config('modules.ecommerce')) {
                $products = Product::with($this->blockProductEagerLoads())
                    ->whereIn('id', $ids)->get();

                foreach ($products as $product) {
                    $lookup[$type][$product->id] = $this->serializeProductForBlock($product, $pathService);
                }
            } elseif ($type === 'blog_post') {
                $posts = BlogPost::with(['author', 'category'])->whereIn('id', $ids)->get();

                foreach ($posts as $post) {
                    $lookup[$type][$post->id] = [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'public_url' => $pathService->blogPostPath($post),
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
                        'public_url' => $pathService->categoryPath($cat),
                    ];
                }
            } elseif ($type === 'brand') {
                $brands = Brand::query()->whereIn('id', $ids)->get();

                foreach ($brands as $brand) {
                    $lookup[$type][$brand->id] = $this->serializeBrandForBlock($brand, $pathService);
                }
            } elseif ($type === 'store') {
                $stores = Store::query()->active()->whereIn('id', $ids)->get();

                foreach ($stores as $store) {
                    $lookup[$type][$store->id] = $this->serializeStoreForBlock($store);
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
                    'type' => $f->type,
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
