<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\ProductCollection;
use App\Models\Brand;
use App\Models\Product;
use App\Services\StorefrontPathService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrandController extends ApiController
{
    public function index(): JsonResponse
    {
        $pathService = resolve(StorefrontPathService::class);
        $brands = Brand::active()
            ->orderBy('position')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo_path']);

        return $this->ok($brands->map(function (Model $model) use ($pathService): array {
            /** @var Brand $brand */
            $brand = $model;

            return [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'logo_url' => $brand->logo_path,
                'public_url' => $pathService->brandPath($brand),
            ];
        })->values()->all());
    }

    public function show(string $slug): JsonResponse
    {
        /** @var Brand $brand */
        $brand = Brand::active()
            ->where('slug', $slug)
            ->firstOrFail();

        return $this->ok([
            'id' => $brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'description' => $brand->description,
            'logo_url' => $brand->logo_path,
            'public_url' => resolve(StorefrontPathService::class)->brandPath($brand),
        ]);
    }

    public function products(Request $request, string $slug): JsonResponse
    {
        /** @var Brand $brand */
        $brand = Brand::active()
            ->where('slug', $slug)
            ->firstOrFail();

        $perPage = (int) ($request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ])['per_page'] ?? 24);

        $products = Product::available()
            ->where('brand_id', $brand->id)
            ->with([
                'thumbnail.media',
                'category',
                'brand',
                'attributeValues.attribute.values',
                'attributeValues.selectedOption',
                'activeVariants:id,product_id,price,compare_at_price,stock_quantity,is_active,backorder_allowed',
                'activeVariants.priceHistory',
                'activeVariants.attributeValues.attribute',
                'activeVariants.attributeValues.attributeValue',
                'promotions' => fn ($q) => $q->active()->select('promotions.id', 'promotions.name', 'promotions.type'),
            ])
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return new ProductCollection($products)->response();
    }
}
