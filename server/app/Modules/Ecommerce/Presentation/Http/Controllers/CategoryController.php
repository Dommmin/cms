<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Domain\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Category Controller
 * Moved to Ecommerce module
 */
final class CategoryController extends Controller
{
    /**
     * GET /api/categories — tree structure
     */
    public function index(Request $request): JsonResponse
    {
        $categories = Category::where('parent_id', null)
            ->where('is_active', true)
            ->with('children.children')
            ->orderBy('position')
            ->get();

        return response()->json($categories);
    }

    /**
     * GET /api/categories/{category:slug}
     */
    public function show(Category $category): JsonResponse
    {
        $category->load([
            'children' => fn ($q) => $q->where('is_active', true),
            'productType',
            'parent',
        ]);

        return response()->json([
            'category'  => $category,
            'breadcrumb' => $category->breadcrumb(),
        ]);
    }

    /**
     * POST /api/categories
     */
    public function store(Request $request): JsonResponse
    {
        $category = Category::create($request->all());
        return response()->json($category, 201);
    }

    /**
     * PUT /api/categories/{category}
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $category->update($request->all());
        return response()->json($category);
    }

    /**
     * DELETE /api/categories/{category}
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted'], 204);
    }
}

