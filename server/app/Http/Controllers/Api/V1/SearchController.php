<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\ProductResource;
use App\Models\Product;
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

        $searchBuilder = Product::search($query);

        $this->applyFilters($searchBuilder, $filters);
        $this->applySorting($searchBuilder, $sort);

        $results = $searchBuilder->paginate($perPage);

        return $this->ok([
            'data' => ProductResource::collection($results->items()),
            'meta' => [
                'total' => $results->total(),
                'per_page' => $results->perPage(),
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'facets' => $this->getFacets($filters),
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

        return $this->ok(['suggestions' => $suggestions]);
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
