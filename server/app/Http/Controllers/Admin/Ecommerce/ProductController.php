<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Data\AdminProductData;
use App\Exports\ProductsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\ImportProductsRequest;
use App\Http\Requests\Admin\Ecommerce\StoreProductRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateProductRequest;
use App\Imports\ProductsImport;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductFlag;
use App\Models\ProductType;
use App\Queries\Admin\ProductIndexQuery;
use App\Services\Admin\Ecommerce\ProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    public function index(Request $request): Response
    {
        $productQuery = new ProductIndexQuery($request);
        $products = $productQuery->execute();

        return inertia('admin/ecommerce/products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'category_id', 'brand_id', 'is_active', 'is_featured']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/ecommerce/products/create', [
            'categories' => Category::all(),
            'types' => ProductType::all(),
            'brands' => Brand::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'flags' => ProductFlag::active()->ordered()->get(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->productService->createProduct($request->validated());

        return redirect()->route('admin.ecommerce.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['category', 'categories', 'images', 'defaultVariant.priceHistory', 'brand', 'flags']);

        $priceHistory = $product->defaultVariant?->priceHistory
            ->map(fn ($ph) => [
                'id' => $ph->id,
                'price' => $ph->price,
                'recorded_at' => $ph->recorded_at->toIsoString(),
            ])
            ->all() ?? [];

        return inertia('admin/ecommerce/products/edit', [
            'product' => AdminProductData::fromModel($product),
            'categories' => Category::all(),
            'types' => ProductType::all(),
            'brands' => Brand::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'flags' => ProductFlag::active()->ordered()->get(),
            'price_history' => $priceHistory,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->productService->updateProduct($product, $request->validated());

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filename = 'products-'.now()->format('Y-m-d').'.xlsx';

        return Excel::download(new ProductsExport($request), $filename);
    }

    public function import(ImportProductsRequest $request): RedirectResponse
    {
        Excel::import(new ProductsImport, $request->file('file'));

        return redirect()->back()->with('success', 'Products imported successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->productService->deleteProduct($product);

        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
