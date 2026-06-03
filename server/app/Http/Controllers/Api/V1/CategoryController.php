<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\CategoryCollection;
use App\Http\Resources\Api\V1\CategoryShowResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        // Load all active categories to build/check paths recursively in-memory
        $allCategories = Category::query()
            ->where('is_active', true)
            ->withCount('products')
            ->get();

        // Get category IDs that have products directly
        $directProductCategoryIds = $allCategories->filter(fn ($cat): bool => $cat->products_count > 0)->pluck('id')->toArray();

        // Build parent -> children map in memory
        $childrenMap = [];
        foreach ($allCategories as $cat) {
            if ($cat->parent_id !== null) {
                $childrenMap[$cat->parent_id][] = $cat->id;
            }
        }

        // Recursive helper to check if category or any of its descendants has products
        $hasProducts = function (int $catId) use (&$hasProducts, $directProductCategoryIds, $childrenMap): bool {
            if (in_array($catId, $directProductCategoryIds, true)) {
                return true;
            }

            if (isset($childrenMap[$catId])) {
                foreach ($childrenMap[$catId] as $childId) {
                    if ($hasProducts($childId)) {
                        return true;
                    }
                }
            }

            return false;
        };

        $categoriesQuery = Category::query()
            ->where('is_active', true)
            ->when($request->parent_id, fn ($q, $id) => $q->where('parent_id', $id))
            ->when(! $request->has('parent_id') && ! $request->boolean('all'), fn ($q) => $q->whereNull('parent_id'))
            ->withCount('products')
            ->with(['children' => fn ($q) => $q->where('is_active', true)->withCount('products')])
            ->orderBy('position');

        $categories = $categoriesQuery->get()
            ->filter(fn (Category $cat): bool => $hasProducts($cat->id))
            ->map(function (Category $cat) use ($hasProducts): Category {
                $cat->setRelation('children', $cat->children->filter(fn (Category $child): bool => $hasProducts($child->id))->values());

                return $cat;
            })
            ->values();

        return $this->ok(new CategoryCollection($categories));
    }

    public function show(string $slug): JsonResponse
    {
        $locale = app()->getLocale();

        $category = Category::query()
            ->where('slug->'.$locale, $slug)
            ->where('is_active', true)
            ->with(['parent', 'children'])
            ->firstOrFail();

        $breadcrumb = $category->breadcrumb();

        return $this->ok(new CategoryShowResource([
            'category' => $category,
            'breadcrumb' => $breadcrumb,
        ]));
    }
}
