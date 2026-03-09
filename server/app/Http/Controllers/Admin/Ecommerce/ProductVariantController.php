<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreProductVariantRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateProductVariantRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateStockRequest;
use App\Models\AttributeValue;
use App\Models\Product;
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
        $variants = (new ProductVariantIndexQuery(request()))->execute($product);

        return inertia('admin/ecommerce/products/variants/index', [
            'product' => $product,
            'variants' => $variants,
        ]);
    }

    public function create(Product $product): Response
    {
        $taxRates = (new ProductVariantIndexQuery(request()))->getTaxRates();

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
        $data['is_active'] = $data['is_active'] ?? true;
        $data['is_default'] = $data['is_default'] ?? false;

        if ($data['is_default']) {
            ProductVariant::where('product_id', $product->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $attributeValueIds = $data['attribute_values'] ?? [];
        unset($data['attribute_values']);

        $variant = ProductVariant::create($data);
        $this->syncVariantAttributeValues($variant, $attributeValueIds);

        return redirect()->route('admin.ecommerce.products.variants.index', $product)
            ->with('success', 'Wariant produktu został utworzony');
    }

    public function edit(Product $product, ProductVariant $variant): Response
    {
        $variant->load(['taxRate', 'attributeValues.attribute']);
        $taxRates = (new ProductVariantIndexQuery(request()))->getTaxRates();

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
            ProductVariant::where('product_id', $product->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $attributeValueIds = $data['attribute_values'] ?? [];
        unset($data['attribute_values']);

        $variant->update($data);
        $this->syncVariantAttributeValues($variant, $attributeValueIds);

        return redirect()->back()->with('success', 'Wariant produktu został zaktualizowany');
    }

    public function destroy(Product $product, ProductVariant $variant): RedirectResponse
    {
        $variant->delete();

        return redirect()->back()->with('success', 'Wariant produktu został usunięty');
    }

    public function updateStock(UpdateStockRequest $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validated();

        $newQuantity = max(0, $variant->stock_quantity + $data['quantity']);
        $variant->update(['stock_quantity' => $newQuantity]);

        return redirect()->back()->with('success', 'Stan magazynowy został zaktualizowany');
    }

    private function variantAttributes(Product $product): Collection
    {
        $product->loadMissing('productType.productTypeAttributes.attribute.values');

        return $product->productType?->productTypeAttributes
            ->sortBy('position')
            ->map(function ($productTypeAttribute) {
                $attribute = $productTypeAttribute->attribute;

                return [
                    'id' => $attribute->id,
                    'name' => $attribute->name,
                    'slug' => $attribute->slug,
                    'is_required' => $productTypeAttribute->is_required,
                    'values' => $attribute->values->map(fn ($value) => [
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
            ->map(fn (AttributeValue $attributeValue) => [
                'variant_id' => $variant->id,
                'attribute_id' => $attributeValue->attribute_id,
                'attribute_value_id' => $attributeValue->id,
            ])
            ->all();

        if ($records !== []) {
            VariantAttributeValue::query()->insert($records);
        }
    }
}
