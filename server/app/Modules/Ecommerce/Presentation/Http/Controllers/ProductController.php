<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Domain\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Product Controller
 * Moved to Ecommerce module
 */
final class ProductController extends Controller
{
    /**
     * GET /api/products
     */
    public function index(Request $request): JsonResponse
    {
        $products = Product::available()
            ->with(['category', 'brand', 'thumbnail', 'variants' => fn ($q) => $q->where('is_active', true)])
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->filled('brand_id'), fn ($q) => $q->where('brand_id', $request->brand_id))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%' . $request->search . '%'))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_order ?? 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($products);
    }

    /**
     * GET /api/products/{product:slug}
     */
    public function show(Product $product): JsonResponse
    {
        $this->authorize('view', $product);

        $product->load([
            'category', 'brand', 'productType',
            'variants.attributeValues.attribute',
            'variants.attributeValues.attributeValue',
            'images',
            'reviews' => fn ($q) => $q->where('status', 'approved')->orderByDesc('created_at')->take(10),
            'reviews.customer',
            'reviews.images',
        ]);

        return response()->json($product);
    }
}

