<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\BlogPost;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SearchLog;
use App\Models\SearchSynonym;
use App\Models\Setting;
use App\Services\StorefrontPathService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Scout\Builder;
use Typesense\Exceptions\ObjectNotFound;

class SearchController extends ApiController
{
    /**
     * Search products with faceting and filters via Typesense.
     *
     * Accepts flat query params:
     *   q=shoes&category=boots&brand=samsung&min_price=1000&max_price=5000&sort=price:asc&page=2
     *
     * Or nested filters (backward compat):
     *   q=shoes&filters[category_id]=5&filters[brand_id]=3&filters[price_min]=1000&filters[price_max]=5000
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        $sort = $request->input('sort', 'created_at:desc');
        $perPage = (int) $request->input('per_page', 20);
        $page = (int) $request->input('page', 1);

        $filters = $this->resolveFilters($request);

        $expandedQuery = $this->expandWithSynonyms($query);

        if (mb_strlen((string) $query) < 2 && empty($filters['category_id']) && empty($filters['brand_id'])) {
            return $this->ok([
                'data' => [],
                'meta' => [
                    'total' => 0,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => 1,
                    'facets' => $this->getFacetFallback([], $filters),
                    'did_you_mean' => null,
                ],
            ]);
        }

        $rawResults = null;
        $useFacets = true;
        $searchBuilder = Product::search($expandedQuery);

        $this->applyFilters($searchBuilder, $filters, withFacets: true);
        $this->applySorting($searchBuilder, $sort);

        $searchBuilder->withRawResults(function (array $results) use (&$rawResults): void {
            $rawResults = $results;
        });

        try {
            $results = $searchBuilder->paginate($perPage, 'page', $page);
        } catch (ObjectNotFound) {
            $useFacets = false;
            $rawResults = null;
            $searchBuilder = Product::search($expandedQuery);
            $this->applyFilters($searchBuilder, $filters, withFacets: false);
            $this->applySorting($searchBuilder, $sort);
            $searchBuilder->withRawResults(function (array $results) use (&$rawResults): void {
                $rawResults = $results;
            });
            $results = $searchBuilder->paginate($perPage, 'page', $page);
        }

        $items = $results->items();

        if ($items !== []) {
            $productIds = array_map(fn (Product $p): int => $p->id, $items);
            $loaded = Product::query()
                ->with(['category', 'brand', 'activeVariants', 'media', 'thumbnail.media', 'promotions'])
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            $items = array_map(fn (Product $p): Product => $loaded->get($p->id, $p), $items);
        }

        if ($results->currentPage() === 1) {
            $items = $this->floatPromotedFirst($items);
        }

        $didYouMean = null;
        if ($results->total() === 0 && mb_strlen((string) $query) >= 2) {
            $didYouMean = $this->findDidYouMean($query);
        }

        if (mb_strlen((string) $query) >= 2) {
            SearchLog::query()->create([
                'query' => mb_strtolower(mb_trim($query)),
                'results_count' => $results->total(),
                'is_autocomplete' => false,
                'locale' => $request->input('locale'),
                'ip' => $request->ip(),
            ]);
        }

        $facetCounts = $rawResults['facet_counts'] ?? [];

        if ($useFacets && $facetCounts !== []) {
            $facets = $this->getFacetsFromTypesense($facetCounts);
        } else {
            $matchingIds = $this->getAllMatchingIds($expandedQuery, $filters);
            $facets = $this->getFacetFallback($matchingIds, $filters);
        }

        return $this->ok([
            'data' => ProductResource::collection($items),
            'meta' => [
                'total' => $results->total(),
                'per_page' => $results->perPage(),
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'facets' => $facets,
                'did_you_mean' => $didYouMean,
            ],
        ]);
    }

    /**
     * Autocomplete suggestions for search input.
     */
    public function autocomplete(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        $limit = (int) $request->input('limit', 10);
        $pathService = resolve(StorefrontPathService::class);

        if (mb_strlen((string) $query) < 2) {
            return $this->ok(['suggestions' => []]);
        }

        $suggestions = collect();
        $categoryLimit = 3;
        $blogPostLimit = 3;
        $productLimit = max(1, $limit - $categoryLimit - $blogPostLimit);

        if ((bool) Setting::get('search', 'index_products', true)) {
            $productResults = Product::search($query)
                ->where('is_active', true)
                ->take($productLimit)
                ->get();

            $productIds = $productResults->map(fn (Product $p): int => $p->id);
            $loaded = Product::query()
                ->with(['category', 'brand', 'activeVariants', 'media', 'thumbnail.media'])
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            foreach ($productResults as $product) {
                $fresh = $loaded->get($product->id, $product);
                $suggestions->push([
                    'type' => 'product',
                    'id' => $fresh->id,
                    'name' => $fresh->name,
                    'slug' => $fresh->slug,
                    'public_url' => $pathService->productPath($fresh),
                    'thumbnail' => $fresh->getFirstMediaUrl('images', 'thumb') ?: null,
                    'price' => $fresh->priceRange()['min'],
                ]);
            }
        }

        if ((bool) Setting::get('search', 'index_categories', true)) {
            $categoryResults = Category::search($query)
                ->where('is_active', true)
                ->take($categoryLimit)
                ->get();

            $categoryIds = $categoryResults->map(fn (Category $c): int => $c->id);
            $loadedCategories = Category::query()
                ->whereIn('id', $categoryIds)
                ->get()
                ->keyBy('id');

            foreach ($categoryResults as $category) {
                $fresh = $loadedCategories->get($category->id, $category);
                $suggestions->push([
                    'type' => 'category',
                    'id' => $fresh->id,
                    'name' => $fresh->name,
                    'slug' => $fresh->slug,
                    'public_url' => $pathService->categoryPath($fresh),
                    'thumbnail' => $fresh->image_path ?: null,
                    'products_count' => $fresh->products()->count(),
                ]);
            }
        }

        if ((bool) Setting::get('search', 'index_blog_posts', true)) {
            $blogResults = BlogPost::search($query)
                ->where('status', 'published')
                ->take($blogPostLimit)
                ->get();

            $blogIds = $blogResults->map(fn (BlogPost $p): int => $p->id);
            $loadedPosts = BlogPost::query()
                ->with('author')
                ->whereIn('id', $blogIds)
                ->get()
                ->keyBy('id');

            foreach ($blogResults as $post) {
                $fresh = $loadedPosts->get($post->id, $post);
                $suggestions->push([
                    'type' => 'blog_post',
                    'id' => $fresh->id,
                    'name' => $fresh->title,
                    'slug' => $fresh->slug,
                    'public_url' => $pathService->blogPostPath($fresh),
                    'thumbnail' => $fresh->featured_image,
                    'excerpt' => is_array($fresh->excerpt) ? ($fresh->excerpt[app()->getLocale()] ?? reset($fresh->excerpt)) : $fresh->excerpt,
                ]);
            }
        }

        SearchLog::query()->create([
            'query' => mb_strtolower(mb_trim($query)),
            'results_count' => $suggestions->count(),
            'is_autocomplete' => true,
            'locale' => $request->input('locale'),
            'ip' => $request->ip(),
        ]);

        return $this->ok(['suggestions' => $suggestions->values()->all()]);
    }

    /**
     * Resolve filters from flat query params or nested filters array.
     * Supports: category (slug or ID), brand (slug or ID), min_price/max_price (in cents).
     *
     * @return array{category_id?: string[], brand_id?: string[], price_min?: int, price_max?: int}
     */
    private function resolveFilters(Request $request): array
    {
        $filters = $request->input('filters', []);
        $result = [];

        $categoryInput = $request->input('category', $filters['category_id'] ?? null);
        if ($categoryInput) {
            $slugs = (array) $categoryInput;
            $ids = [];
            foreach ($slugs as $slug) {
                if (is_numeric($slug)) {
                    $ids[] = (string) $slug;
                } else {
                    $category = Category::query()
                        ->where(function ($q) use ($slug): void {
                            $q->where('slug->en', $slug)
                                ->orWhere('slug->pl', $slug);
                        })
                        ->first();
                    if ($category) {
                        $ids[] = (string) $category->id;
                    }
                }
            }

            if ($ids !== []) {
                $result['category_id'] = $ids;
            }
        }

        $brandInput = $request->input('brand', $filters['brand_id'] ?? null);
        if ($brandInput) {
            $brandSlugs = (array) $brandInput;
            $ids = [];
            foreach ($brandSlugs as $slugOrId) {
                if (is_numeric($slugOrId)) {
                    $ids[] = (string) $slugOrId;
                } else {
                    $brand = Brand::query()->where('slug', $slugOrId)->first();
                    if ($brand) {
                        $ids[] = (string) $brand->id;
                    }
                }
            }

            if ($ids !== []) {
                $result['brand_id'] = $ids;
            }
        }

        $priceMin = $request->input('min_price', $filters['price_min'] ?? null);
        $priceMax = $request->input('max_price', $filters['price_max'] ?? null);
        if ($priceMin !== null) {
            $result['price_min'] = (int) $priceMin;
        }

        if ($priceMax !== null) {
            $result['price_max'] = (int) $priceMax;
        }

        return $result;
    }

    /**
     * Expand search query with synonyms from DB.
     */
    private function expandWithSynonyms(string $query): string
    {
        if (mb_strlen($query) < 2) {
            return $query;
        }

        $lower = mb_strtolower(mb_trim($query));

        $synonym = SearchSynonym::query()
            ->where('is_active', true)
            ->get()
            ->first(function (SearchSynonym $s) use ($lower): bool {
                $synonymWords = array_map(mb_strtolower(...), $s->synonyms ?? []);

                return in_array($lower, $synonymWords, true) || mb_strtolower($s->term) === $lower;
            });

        if (! $synonym) {
            return $query;
        }

        $terms = array_merge([$synonym->term], $synonym->synonyms ?? []);
        $terms = array_unique(array_filter($terms));

        return implode(' OR ', $terms);
    }

    /**
     * Float promoted products to the beginning of the result list.
     *
     * @param  array<Product>  $items
     * @return array<Product>
     */
    private function floatPromotedFirst(array $items): array
    {
        $promoted = array_filter($items, fn (Product $p): bool => (bool) $p->is_search_promoted);
        $regular = array_filter($items, fn (Product $p): bool => ! $p->is_search_promoted);

        return array_values(array_merge($promoted, $regular));
    }

    /**
     * Suggest a "did you mean" query from past successful searches.
     */
    private function findDidYouMean(string $query): ?string
    {
        $lower = mb_strtolower(mb_trim($query));

        $suggestion = SearchLog::query()
            ->where('results_count', '>', 0)
            ->where('is_autocomplete', false)
            ->where('query', 'like', '%'.mb_substr($lower, 0, 3).'%')
            ->where('query', '!=', $lower)
            ->orderByDesc('results_count')
            ->value('query');

        return $suggestion ?: null;
    }

    /**
     * Get all matching product IDs from Typesense for facet computation.
     *
     * @param  array{category_id?: string[], brand_id?: string[], price_min?: int, price_max?: int}  $filters
     * @return int[]
     */
    private function getAllMatchingIds(string $expandedQuery, array $filters): array
    {
        $builder = Product::search($expandedQuery);
        $this->applyFilters($builder, $filters, withFacets: false);
        $matching = $builder->take(250)->get();

        return $matching->map(fn (Product $p): int => $p->id)->all();
    }

    /**
     * Apply filters to the Scout/Typesense search builder.
     *
     * @param  array{category_id?: string[], brand_id?: string[], price_min?: int, price_max?: int}  $filters
     * @param  bool  $withFacets  Whether to request facet_counts from Typesense
     */
    private function applyFilters(Builder $builder, array $filters, bool $withFacets = true): void
    {
        $filterParts = ['is_active:true'];

        if (isset($filters['category_id'])) {
            $filterParts[] = 'category_id:['.implode(', ', $filters['category_id']).']';
        }

        if (isset($filters['brand_id'])) {
            $filterParts[] = 'brand_id:['.implode(', ', $filters['brand_id']).']';
        }

        if (isset($filters['price_min']) && isset($filters['price_max'])) {
            $filterParts[] = 'price:['.$filters['price_min'].'..'.$filters['price_max'].']';
        } elseif (isset($filters['price_min'])) {
            $filterParts[] = 'price:>='.$filters['price_min'];
        } elseif (isset($filters['price_max'])) {
            $filterParts[] = 'price:<='.$filters['price_max'];
        }

        $options = [
            'filter_by' => implode(' && ', $filterParts),
        ];

        if ($withFacets) {
            $options['facet_by'] = 'category_id,brand_id,price';
            $options['max_facet_values'] = 100;
        }

        $builder->options($options);
    }

    private function applySorting(Builder $builder, string $sort): void
    {
        $allowedSorts = [
            'created_at:desc',
            'created_at:asc',
            'price:asc',
            'price:desc',
            'name:asc',
            'name:desc',
        ];

        if (in_array($sort, $allowedSorts, true)) {
            [$column, $direction] = explode(':', $sort);
            $builder->orderBy($column, $direction);
        }
    }

    /**
     * Build facets from Typesense facet_counts, resolving IDs to names/slugs.
     *
     * @param  array  $facetCounts  Raw facet_counts from Typesense response
     */
    private function getFacetsFromTypesense(array $facetCounts): array
    {
        $categoryFacet = null;
        $brandFacet = null;
        $priceFacet = null;

        foreach ($facetCounts as $facet) {
            $fieldName = $facet['field_name'] ?? ($facet['field'] ?? null);
            if ($fieldName === 'category_id') {
                $categoryFacet = $facet;
            } elseif ($fieldName === 'brand_id') {
                $brandFacet = $facet;
            } elseif ($fieldName === 'price') {
                $priceFacet = $facet;
            }
        }

        return [
            'categories' => $this->buildCategoryFacets($categoryFacet),
            'brands' => $this->buildBrandFacets($brandFacet),
            'price_ranges' => $this->buildPriceRanges(),
        ];
    }

    private function buildCategoryFacets(?array $facet): array
    {
        if ($facet === null) {
            return [];
        }

        $counts = collect($facet['counts'] ?? []);
        if ($counts->isEmpty()) {
            return [];
        }

        $categoryIds = $counts->pluck('value')->map(fn (string $v): int => (int) $v)->all();

        $categories = Category::query()
            ->whereIn('id', $categoryIds)
            ->get()
            ->keyBy('id');

        return $counts
            ->map(function (array $item) use ($categories): ?array {
                $id = (int) $item['value'];
                $category = $categories->get($id);
                if ($category === null) {
                    return null;
                }

                return [
                    'id' => (string) $id,
                    'slug' => $category->slug,
                    'name' => $category->name,
                    'count' => $item['count'],
                ];
            })
            ->filter()
            ->sortByDesc('count')
            ->values()
            ->all();
    }

    private function buildBrandFacets(?array $facet): array
    {
        if ($facet === null) {
            return [];
        }

        $counts = collect($facet['counts'] ?? []);
        if ($counts->isEmpty()) {
            return [];
        }

        $brandIds = $counts->pluck('value')->map(fn (string $v): int => (int) $v)->all();

        $brands = Brand::query()
            ->whereIn('id', $brandIds)
            ->get()
            ->keyBy('id');

        return $counts
            ->map(function (array $item) use ($brands): ?array {
                $id = (int) $item['value'];
                $brand = $brands->get($id);
                if ($brand === null) {
                    return null;
                }

                return [
                    'id' => (string) $id,
                    'slug' => $brand->slug,
                    'name' => $brand->name,
                    'count' => $item['count'],
                ];
            })
            ->filter()
            ->sortByDesc('count')
            ->values()
            ->all();
    }

    private function buildPriceRanges(): array
    {
        return ProductVariant::getActivePriceBounds();
    }

    /**
     * DB-based facet fallback when Typesense facets are unavailable.
     * Filters by matching product IDs so counts reflect search results.
     *
     * @param  int[]  $matchingIds  Product IDs from Typesense search (empty = no search query)
     * @param  array{category_id?: string[], brand_id?: string[], price_min?: int, price_max?: int}  $activeFilters
     */
    private function getFacetFallback(array $matchingIds, array $activeFilters): array
    {
        return [
            'categories' => $this->getCategoryFacetsFallback($matchingIds, $activeFilters),
            'brands' => $this->getBrandFacetsFallback($matchingIds, $activeFilters),
            'price_ranges' => $this->getPriceRangesFallback(),
        ];
    }

    /**
     * @param  int[]  $matchingIds
     * @param  array{category_id?: string[], brand_id?: string[], price_min?: int, price_max?: int}  $activeFilters
     */
    private function getCategoryFacetsFallback(array $matchingIds, array $activeFilters): array
    {
        $productsQuery = Product::query()->where('is_active', true);

        if ($matchingIds !== []) {
            $productsQuery->whereIn('id', $matchingIds);
        }

        if (isset($activeFilters['brand_id'])) {
            $productsQuery->whereIn('brand_id', $activeFilters['brand_id']);
        }

        $categoryCounts = $productsQuery
            ->selectRaw('category_id, COUNT(*) as count')
            ->groupBy('category_id')
            ->pluck('count', 'category_id');

        $categoryIds = $categoryCounts->keys()->all();

        if ($categoryIds === []) {
            return [];
        }

        $categories = Category::query()
            ->whereIn('id', $categoryIds)
            ->get()
            ->keyBy('id');

        return collect($categoryIds)
            ->map(function ($id) use ($categories, $categoryCounts): ?array {
                $category = $categories->get($id);
                if ($category === null) {
                    return null;
                }

                return [
                    'id' => (string) $id,
                    'slug' => $category->slug,
                    'name' => $category->name,
                    'count' => $categoryCounts[$id],
                ];
            })
            ->filter()
            ->sortByDesc('count')
            ->values()
            ->all();
    }

    /**
     * @param  int[]  $matchingIds
     * @param  array{category_id?: string[], brand_id?: string[], price_min?: int, price_max?: int}  $activeFilters
     */
    private function getBrandFacetsFallback(array $matchingIds, array $activeFilters): array
    {
        $productsQuery = Product::query()
            ->where('is_active', true)
            ->whereNotNull('brand_id');

        if ($matchingIds !== []) {
            $productsQuery->whereIn('id', $matchingIds);
        }

        if (isset($activeFilters['category_id'])) {
            $productsQuery->whereIn('category_id', $activeFilters['category_id']);
        }

        $brandCounts = $productsQuery
            ->selectRaw('brand_id, COUNT(*) as count')
            ->groupBy('brand_id')
            ->pluck('count', 'brand_id');

        $brandIds = $brandCounts->keys()->all();

        if ($brandIds === []) {
            return [];
        }

        $brands = Brand::query()
            ->whereIn('id', $brandIds)
            ->get()
            ->keyBy('id');

        return collect($brandIds)
            ->map(function ($id) use ($brands, $brandCounts): ?array {
                $brand = $brands->get($id);
                if ($brand === null) {
                    return null;
                }

                return [
                    'id' => (string) $id,
                    'slug' => $brand->slug,
                    'name' => $brand->name,
                    'count' => $brandCounts[$id],
                ];
            })
            ->filter()
            ->sortByDesc('count')
            ->values()
            ->all();
    }

    private function getPriceRangesFallback(): array
    {
        return ProductVariant::getActivePriceBounds();
    }
}
