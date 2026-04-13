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
use App\Imports\ProductsImportPreview;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductFlag;
use App\Models\ProductType;
use App\Queries\Admin\ProductIndexQuery;
use App\Services\Admin\Ecommerce\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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
            'flags' => ProductFlag::query()->active()->ordered()->get(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->productService->createProduct($request->validated());

        return to_route('admin.ecommerce.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['category', 'categories', 'images', 'defaultVariant.priceHistory', 'brand', 'flags']);

        $priceHistory = $product->defaultVariant?->priceHistory
            ->map(fn ($ph): array => [
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
            'flags' => ProductFlag::query()->active()->ordered()->get(),
            'price_history' => $priceHistory,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->productService->updateProduct($product, $request->validated());

        return back()->with('success', 'Product updated successfully.');
    }

    public function validateImport(ImportProductsRequest $request): JsonResponse
    {
        $preview = new ProductsImportPreview;
        Excel::import($preview, $request->file('file'));

        $rows = $preview->getRows();

        if ($rows->isEmpty()) {
            return response()->json([
                'valid' => false,
                'errors' => [],
                'preview' => [],
                'total_rows' => 0,
                'missing_headers' => [],
            ]);
        }

        $firstRow = $rows->first();
        $headers = is_array($firstRow) ? array_keys($firstRow) : $firstRow->keys()->all();
        $missingHeaders = $preview->validateHeaders($headers);

        if ($missingHeaders !== []) {
            return response()->json([
                'valid' => false,
                'errors' => [],
                'preview' => [],
                'total_rows' => 0,
                'missing_headers' => $missingHeaders,
            ]);
        }

        $importRules = (new ProductsImport)->rules();
        $validationErrors = [];

        foreach ($rows as $index => $row) {
            $rowArray = is_array($row) ? $row : $row->toArray();
            $rowNumber = $index + 2; // +2 because row 1 is the header

            $validator = Validator::make($rowArray, $importRules);

            if ($validator->fails()) {
                foreach ($validator->errors()->toArray() as $field => $messages) {
                    foreach ($messages as $message) {
                        $validationErrors[] = [
                            'row' => $rowNumber,
                            'field' => $field,
                            'message' => $message,
                        ];
                    }
                }
            }
        }

        return response()->json([
            'valid' => $validationErrors === [],
            'errors' => $validationErrors,
            'preview' => $rows->map(fn ($row): array => is_array($row) ? $row : $row->toArray())->values()->all(),
            'total_rows' => $rows->count(),
            'missing_headers' => [],
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filename = 'products-'.now()->format('Y-m-d').'.xlsx';

        return Excel::download(new ProductsExport($request), $filename);
    }

    public function import(ImportProductsRequest $request): RedirectResponse
    {
        Excel::import(new ProductsImport, $request->file('file'));

        return back()->with('success', 'Products imported successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->productService->deleteProduct($product);

        return back()->with('success', 'Product deleted successfully.');
    }
}
