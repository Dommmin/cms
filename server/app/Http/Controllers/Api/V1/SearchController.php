<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SearchLog;
use App\Models\SearchSynonym;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Scout\Builder;

class SearchController extends ApiController
{
    /**
     * Search products with faceting and filters via Typesense.
     *
     * Accepts flat query params:
     *   q=shoes&category=boots&brand=5&min_price=1000&max_price=5000&sort=price:asc&page=2
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
                    'facets' => $this->getFacets($filters),
                    'did_you_mean' => null,
                ],
            ]);
        }

        $searchBuilder = Product::search($expandedQuery);

        $this->applyFilters($searchBuilder, $filters);
        $this->applySorting($searchBuilder, $sort);

        $results = $searchBuilder->paginate($perPage, 'page', $page);

        $items = $results->items();

        // Eager-load relations needed by ProductResource (Scout returns bare models)
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

        return $this->ok([
            'data' => ProductResource::collection($items),
            'meta' => [
                'total' => $results->total(),
                'per_page' => $results->perPage(),
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'facets' => $this->getFacets($filters),
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

        if (mb_strlen((string) $query) < 2) {
            return $this->ok(['suggestions' => []]);
        }

$results = Product::search($query)
            ->where('is_active', true)
            ->take($limit)
            ->get();

        $productIds = $results->map(fn (Product $p): int => $p->id);
        $loaded = Product::query()
            ->with(['category', 'brand', 'activeVariants', 'media', 'thumbnail.media'])
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $suggestions = $results->map(function (Product $product) use ($loaded): array {
            $fresh = $loaded->get($product->id, $product);

            return [
                'id' => $fresh->id,
                'name' => $fresh->name,
                'slug' => $fresh->slug,
                'thumbnail' => $fresh->getFirstMediaUrl('images', 'thumb') ?: null,
                'price' => $fresh->priceRange()['min'],
            ];
        });

        SearchLog::query()->create([
            'query' => mb_strtolower(mb_trim($query)),
            'results_count' => $results->count(),
            'is_autocomplete' => true,
            'locale' => $request->input('locale'),
            'ip' => $request->ip(),
        ]);

        return $this->ok(['suggestions' => $suggestions]);
    }

    /**
     * Resolve filters from flat query params or nested filters array.
     * Supports: category (slug or ID), brand (ID), min_price/max_price (in cents).
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
                    $category = Category::query()->where('slug', $slug)->first();
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
            $result['brand_id'] = array_map('strval', (array) $brandInput);
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
     * If the query matches a synonym word, also include the main term.
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
     * Apply filters to the Scout/Typesense search builder.
     *
     * @param  array{category_id?: string[], brand_id?: string[], price_min?: int, price_max?: int}  $filters
     */
    private function applyFilters(Builder $builder, array $filters): void
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

        $builder->options(['filter_by' => implode(' && ', $filterParts)]);
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
     * @param  array{category_id?: string[], brand_id?: string[], price_min?: int, price_max?: int}  $activeFilters
     */
    private function getFacets(array $activeFilters): array
    {
        return [
            'categories' => $this->getCategoryFacets($activeFilters),
            'brands' => $this->getBrandFacets($activeFilters),
            'price_ranges' => $this->getPriceRanges(),
        ];
    }

    /**
     * @param  array{category_id?: string[], brand_id?: string[], price_min?: int, price_max?: int}  $activeFilters
     */
    private function getCategoryFacets(array $activeFilters): array
    {
        $query = Category::query()
            ->whereHas('products', fn (EloquentBuilder $q) => $q->where('is_active', true))
            ->withCount(['products' => fn (EloquentBuilder $q) => $q->where('is_active', true)]);

        if (isset($activeFilters['brand_id'])) {
            $query->whereHas('products', fn (EloquentBuilder $q) => $q->where('is_active', true)->whereIn('brand_id', $activeFilters['brand_id']));
        }

        return $query
            ->get()
            ->map(fn (Category $category): array => [
                'id' => (string) $category->id,
                'slug' => $category->slug,
                'name' => $category->name,
                'count' => $category->products_count,
            ])
            ->sortByDesc('count')
            ->values()
            ->all();
    }

    /**
     * @param  array{category_id?: string[], brand_id?: string[], price_min?: int, price_max?: int}  $activeFilters
     */
    private function getBrandFacets(array $activeFilters): array
    {
        $query = Product::query()
            ->where('is_active', true)
            ->whereNotNull('brand_id')
            ->with('brand');

        if (isset($activeFilters['category_id'])) {
            $query->whereIn('category_id', $activeFilters['category_id']);
        }

        $products = $query->get();

        return $products
            ->groupBy('brand_id')
            ->map(fn ($products, $brandId): array => [
                'id' => (string) $brandId,
                'name' => $products->first()?->brand?->name,
                'count' => $products->count(),
            ])
            ->sortByDesc('count')
            ->values()
            ->all();
    }

    private function getPriceRanges(): array
    {
        $prices = ProductVariant::query()
            ->whereHas('product', fn (EloquentBuilder $q) => $q->where('is_active', true))
            ->selectRaw('MIN(price) AS min_price, MAX(price) AS max_price')
            ->first();

        return [
            'min' => (int) ($prices->min_price ?? 0),
            'max' => (int) ($prices->max_price ?? 0),
        ];
    }
}