<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute(): LengthAwarePaginator
    {
        $perPage = min(max($this->request->integer('per_page', 20), 1), 100);

        return Product::query()
            ->with(['category:id,name', 'productType:id,name', 'defaultVariant:id,product_id,price', 'thumbnail.media'])
            ->when($this->request->search, function ($query, $search) {
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('variants', function ($variantQuery) use ($search): void {
                            $variantQuery->where('sku', 'like', "%{$search}%");
                        });
                });
            })
            ->when($this->request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($this->request->brand_id, function ($query, $brandId) {
                $query->where('brand_id', $brandId);
            })
            ->when($this->request->has('is_active'), function ($query) {
                $query->where('is_active', $this->request->boolean('is_active'));
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->through(function (Product $product): array {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->defaultVariant?->price ?? 0,
                    'is_active' => $product->is_active,
                    'is_saleable' => $product->is_saleable,
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->name,
                    ] : null,
                    'product_type' => $product->productType ? [
                        'id' => $product->productType->id,
                        'name' => $product->productType->name,
                    ] : null,
                    'images' => $product->thumbnail?->media ? [
                        ['url' => $product->thumbnail->media->getUrl()],
                    ] : [],
                ];
            })
            ->withQueryString();
    }
}
