<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Product;
use App\Models\SearchLog;
use App\Models\SearchSynonym;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Scout\Builder;

class SearchController extends ApiController
{
    /**
     * Search products with faceting and autocomplete.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        $filters = $request->input('filters', []);
        $sort = $request->input('sort', 'created_at:desc');
        $perPage = (int) $request->input('per_page', 20);

        $expandedQuery = $this->expandWithSynonyms($query);

        $searchBuilder = Product::search($expandedQuery);

        $this->applyFilters($searchBuilder, $filters);
        $this->applySorting($searchBuilder, $sort);

        $results = $searchBuilder->paginate($perPage);

        // Float promoted products to top on first page
        $items = $results->items();
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
            ->take($limit)
            ->get();

        $suggestions = $results->map(fn (Product $product): array => [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'thumbnail' => $product->getFirstMediaUrl('images', 'thumb'),
            'price' => $product->priceRange()['min'],
        ]);

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

    private function applyFilters(Builder $builder, array $filters): void
    {
        $filterParts = ['is_active:true'];

        if (isset($filters['category_id'])) {
            $categoryIds = (array) $filters['category_id'];
            $filterParts[] = 'category_id:'.implode(',', $categoryIds);
        }

        if (isset($filters['brand_id'])) {
            $brandIds = (array) $filters['brand_id'];
            $filterParts[] = 'brand_id:'.implode(',', $brandIds);
        }

        if (isset($filters['price_min'], $filters['price_max'])) {
            $filterParts[] = 'price:['.(int) $filters['price_min'].'..'.(int) $filters['price_max'].']';
        }

        $builder->whereIn('is_active', [true]);
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
            $builder->orderBy($sort);
        }
    }

    private function getFacets(array $activeFilters): array
    {
        return [
            'categories' => $this->getCategoryFacets($activeFilters),
            'brands' => $this->getBrandFacets($activeFilters),
            'price_ranges' => $this->getPriceRanges(),
        ];
    }

    private function getCategoryFacets(array $activeFilters): array
    {
        $query = Product::query()
            ->where('is_active', true)
            ->with('category');

        if (isset($activeFilters['brand_id'])) {
            $query->whereIn('brand_id', (array) $activeFilters['brand_id']);
        }

        $products = $query->get();

        return $products
            ->groupBy('category_id')
            ->map(fn ($products, $categoryId): array => [
                'id' => $categoryId,
                'name' => $products->first()?->category?->name,
                'count' => $products->count(),
            ])
            ->sortByDesc('count')
            ->values()
            ->all();
    }

    private function getBrandFacets(array $activeFilters): array
    {
        $query = Product::query()
            ->where('is_active', true)
            ->whereNotNull('brand_id')
            ->with('brand');

        if (isset($activeFilters['category_id'])) {
            $query->whereIn('category_id', (array) $activeFilters['category_id']);
        }

        $products = $query->get();

        return $products
            ->groupBy('brand_id')
            ->map(fn ($products, $brandId): array => [
                'id' => $brandId,
                'name' => $products->first()?->brand?->name,
                'count' => $products->count(),
            ])
            ->sortByDesc('count')
            ->values()
            ->toArray();
    }

    private function getPriceRanges(): array
    {
        $minPrice = Product::query()
            ->where('is_active', true)
            ->min('price') ?? 0;

        $maxPrice = Product::query()
            ->where('is_active', true)
            ->max('price') ?? 0;

        return [
            'min' => $minPrice,
            'max' => $maxPrice,
        ];
    }
}
