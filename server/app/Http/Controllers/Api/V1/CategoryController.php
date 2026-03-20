<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CategoryCollection;
use App\Http\Resources\Api\V1\CategoryShowResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->when($request->parent_id, fn ($q, $id) => $q->where('parent_id', $id))
            ->when(! $request->has('parent_id') && ! $request->boolean('all'), fn ($q) => $q->whereNull('parent_id'))
            ->withCount('products')
            ->with(['children' => fn ($q) => $q->withCount('products')])
            ->orderBy('position')
            ->get()
            // Exclude categories with no products (directly or through one level of children)
            ->filter(fn (Category $cat) => $cat->products_count > 0
                || $cat->children->sum('products_count') > 0)
            ->values();

        return response()->json(new CategoryCollection($categories));
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with(['parent', 'children'])
            ->firstOrFail();

        $breadcrumb = $category->breadcrumb();

        return response()->json(new CategoryShowResource([
            'category' => $category,
            'breadcrumb' => $breadcrumb,
        ]));
    }
}
