<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Domain\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SearchController extends Controller
{
    /**
     * Search products
     * GET /api/search?q=query&category_id=1&brand_id=2&min_price=1000&max_price=5000
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['nullable', 'string', 'min:2', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'min_price' => ['nullable', 'integer', 'min:0'],
            'max_price' => ['nullable', 'integer', 'min:0'],
            'sort_by' => ['nullable', 'string', 'in:price_asc,price_desc,name_asc,name_desc,rating_desc,created_desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = $request->input('q');
        $perPage = $request->input('per_page', 20);

        // If no search query, use regular Eloquent query
        if (empty($query)) {
            $products = Product::available()
                ->when($request->filled('category_id'), fn($q) => $q->where('category_id', $request->category_id))
                ->when($request->filled('brand_id'), fn($q) => $q->where('brand_id', $request->brand_id))
                ->with(['category', 'brand', 'thumbnail', 'activeVariants'])
                ->orderBy($this->getSortColumn($request->input('sort_by')), $this->getSortDirection($request->input('sort_by')))
                ->paginate($perPage);

            return response()->json($products);
        }

        // Use Scout search
        $products = Product::search($query)
            ->when($request->filled('category_id'), function ($search) use ($request) {
                return $search->where('category_id', $request->category_id);
            })
            ->when($request->filled('brand_id'), function ($search) use ($request) {
                return $search->where('brand_id', $request->brand_id);
            })
            ->when($request->filled('min_price'), function ($search) use ($request) {
                return $search->where('price_min', '>=', $request->min_price);
            })
            ->when($request->filled('max_price'), function ($search) use ($request) {
                return $search->where('price_max', '<=', $request->max_price);
            })
            ->when($request->filled('sort_by'), function ($search) use ($request) {
                return $search->orderBy($this->getSortColumn($request->sort_by), $this->getSortDirection($request->sort_by));
            })
            ->paginate($perPage);

        // Load relationships
        $products->load(['category', 'brand', 'thumbnail', 'activeVariants']);

        return response()->json($products);
    }

    /**
     * Get sort column from sort_by parameter
     */
    private function getSortColumn(?string $sortBy): string
    {
        return match($sortBy) {
            'price_asc', 'price_desc' => 'price_min',
            'name_asc', 'name_desc' => 'name',
            'rating_desc' => 'average_rating',
            'created_desc' => 'created_at',
            default => 'created_at',
        };
    }

    /**
     * Get sort direction from sort_by parameter
     */
    private function getSortDirection(?string $sortBy): string
    {
        return match($sortBy) {
            'price_asc', 'name_asc' => 'asc',
            default => 'desc',
        };
    }
}

