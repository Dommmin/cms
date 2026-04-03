<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreProductVariantRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateProductVariantRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateStockRequest;
use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\VariantAttributeValue;
use App\Queries\Admin\ProductVariantIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Inertia\Response;

class ProductVariantController extends Controller
{
    public function index(Product $product): Response
    {
        $variants = new ProductVariantIndexQuery(request())->execute($product);

        return inertia('admin/ecommerce/products/variants/index', [
            'product' => $product,
            'variants' => $variants,
        ]);
    }

    public function create(Product $product): Response
    {
        $taxRates = new ProductVariantIndexQuery(request())->getTaxRates();

        return inertia('admin/ecommerce/products/variants/create', [
            'product' => $product,
            'taxRates' => $taxRates,
            'attributes' => $this->variantAttributes($product),
        ]);
    }

    public function store(StoreProductVariantRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        $data['product_id'] = $product->id;
        $data['is_active'] ??= true;
        $data['is_default'] ??= false;
        $data['is_digital'] ??= false;

        if ($data['is_default']) {
            ProductVariant::query()->where('product_id', $product->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $attributeValueIds = $data['attribute_values'] ?? [];
        unset($data['attribute_values']);

        $images = $data['images'] ?? [];
        unset($data['images']);

        $variant = ProductVariant::query()->create($data);
        $this->syncVariantAttributeValues($variant, $attributeValueIds);
        $this->syncVariantImages($variant, $product, $images);

        return to_route('admin.ecommerce.products.variants.index', $product)
            ->with('success', 'Wariant produktu został utworzony');
    }

    public function edit(Product $product, ProductVariant $variant): Response
    {
        $variant->load(['taxRate', 'attributeValues.attribute', 'images.media']);

        $taxRates = new ProductVariantIndexQuery(request())->getTaxRates();

        return inertia('admin/ecommerce/products/variants/edit', [
            'product' => $product,
            'variant' => $variant,
            'taxRates' => $taxRates,
            'attributes' => $this->variantAttributes($product),
        ]);
    }

    public function update(UpdateProductVariantRequest $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validated();

        if (($data['is_default'] ?? false) && ! $variant->is_default) {
            ProductVariant::query()->where('product_id', $product->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $attributeValueIds = $data['attribute_values'] ?? [];
        unset($data['attribute_values']);

        $images = $data['images'] ?? [];
        unset($data['images']);

        $variant->update($data);
        $this->syncVariantAttributeValues($variant, $attributeValueIds);
        $this->syncVariantImages($variant, $product, $images);

        return back()->with('success', 'Wariant produktu został zaktualizowany');
    }

    public function destroy(Product $product, ProductVariant $variant): RedirectResponse
    {
        $variant->delete();

        return back()->with('success', 'Wariant produktu został usunięty');
    }

    public function updateStock(UpdateStockRequest $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validated();

        $newQuantity = max(0, $variant->stock_quantity + $data['quantity']);
        $variant->update(['stock_quantity' => $newQuantity]);

        return back()->with('success', 'Stan magazynowy został zaktualizowany');
    }

    private function variantAttributes(Product $product): Collection
    {
        $product->loadMissing('productType.productTypeAttributes.attribute.values');

        return $product->productType?->productTypeAttributes
            ->sortBy('position')
            ->map(function ($productTypeAttribute): array {
                $attribute = $productTypeAttribute->attribute;

                return [
                    'id' => $attribute->id,
                    'name' => $attribute->name,
                    'slug' => $attribute->slug,
                    'is_required' => $productTypeAttribute->is_required,
                    'values' => $attribute->values->map(fn ($value): array => [
                        'id' => $value->id,
                        'value' => $value->value,
                        'slug' => $value->slug,
                    ])->values()->all(),
                ];
            })
            ->values() ?? collect();
    }

    private function syncVariantAttributeValues(ProductVariant $variant, array $attributeValueIds): void
    {
        $attributeValues = AttributeValue::query()
            ->whereIn('id', $attributeValueIds)
            ->get(['id', 'attribute_id']);

        VariantAttributeValue::query()
            ->where('variant_id', $variant->id)
            ->delete();

        $records = $attributeValues
            ->unique('attribute_id')
            ->values()
            ->map(fn (AttributeValue $attributeValue): array => [
                'variant_id' => $variant->id,
                'attribute_id' => $attributeValue->attribute_id,
                'attribute_value_id' => $attributeValue->id,
            ])
            ->all();

        if ($records !== []) {
            VariantAttributeValue::query()->insert($records);
        }
    }

    private function syncVariantImages(ProductVariant $variant, Product $product, array $images): void
    {
        ProductImage::query()
            ->where('variant_id', $variant->id)
            ->delete();

        foreach ($images as $index => $imageData) {
            $image = is_array($imageData) ? $imageData : json_decode((string) $imageData, true);

            if (! is_array($image)) {
                continue;
            }

            $mediaId = $image['media_id'] ?? $image['id'] ?? null;

            if (! is_numeric($mediaId)) {
                continue;
            }

            ProductImage::query()->create([
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'media_id' => (int) $mediaId,
                'is_thumbnail' => filter_var($image['is_thumbnail'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'position' => is_numeric($image['position'] ?? null) ? (int) $image['position'] : $index,
            ]);
        }
    }
}
