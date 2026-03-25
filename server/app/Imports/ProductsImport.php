<?php

declare(strict_types=1);

namespace App\Imports;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\VariantAttributeValue;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class ProductsImport implements OnEachRow, WithChunkReading, WithHeadingRow, WithValidation
{
    public function onRow(Row $row): void
    {
        $data = $row->toArray();

        /** @var ProductType|null $productType */
        $productType = ProductType::query()->first();

        if (! $productType) {
            return;
        }

        /** @var Category|null $defaultCategory */
        $defaultCategory = Category::query()->first();

        if (! $defaultCategory) {
            return;
        }

        $hasVariantRow = ! empty($data['variant_sku']);

        if ($hasVariantRow) {
            $this->upsertProductWithVariant($data, $productType, $defaultCategory);
        } else {
            $this->createProductWithDefaultVariant($data, $productType, $defaultCategory);
        }
    }

    /** @return array<string, string[]> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'variant_sku' => ['nullable', 'string', 'max:100'],
            'variant_price' => ['nullable', 'numeric', 'min:0'],
            'variant_stock' => ['nullable', 'integer', 'min:0'],
            'variant_name' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function chunkSize(): int
    {
        return 200;
    }

    /** @param array<string, mixed> $data */
    private function findOrCreateProduct(array $data, ProductType $productType, Category $defaultCategory): Product
    {
        /** @var Product|null $existing */
        $existing = Product::query()->where('sku_prefix', $data['sku'])->first();

        if ($existing) {
            return $existing;
        }

        $baseSlug = Str::slug((string) $data['name']);
        $slug = Product::query()->where('slug', $baseSlug)->exists()
            ? $baseSlug.'-'.Str::random(6)
            : $baseSlug;

        return Product::query()->create([
            'name' => $data['name'],
            'slug' => $slug,
            'sku_prefix' => $data['sku'],
            'description' => $data['description'] ?? '',
            'short_description' => '',
            'is_active' => true,
            'is_saleable' => true,
            'product_type_id' => $productType->id,
            'category_id' => $defaultCategory->id,
        ]);
    }

    /** @param array<string, mixed> $data */
    private function createProductWithDefaultVariant(array $data, ProductType $productType, Category $defaultCategory): void
    {
        $product = $this->findOrCreateProduct($data, $productType, $defaultCategory);

        if (! $product->variants()->where('sku', $data['sku'])->exists()) {
            ProductVariant::query()->create([
                'product_id' => $product->id,
                'sku' => $data['sku'],
                'name' => 'Default',
                'price' => (int) round((float) $data['price'] * 100),
                'stock_quantity' => (int) ($data['stock'] ?? 0),
                'is_active' => true,
                'is_default' => true,
            ]);
        }
    }

    /** @param array<string, mixed> $data */
    private function upsertProductWithVariant(array $data, ProductType $productType, Category $defaultCategory): void
    {
        $product = $this->findOrCreateProduct($data, $productType, $defaultCategory);

        if ($product->variants()->where('sku', $data['variant_sku'])->exists()) {
            return;
        }

        $isFirstVariant = $product->variants()->count() === 0;

        $variantPrice = empty($data['variant_price'])
            ? (int) round((float) ($data['price'] ?? 0) * 100)
            : (int) round((float) $data['variant_price'] * 100);

        $variant = ProductVariant::query()->create([
            'product_id' => $product->id,
            'sku' => $data['variant_sku'],
            'name' => $data['variant_name'] ?? 'Variant',
            'price' => $variantPrice,
            'stock_quantity' => (int) ($data['variant_stock'] ?? $data['stock'] ?? 0),
            'is_active' => true,
            'is_default' => $isFirstVariant,
        ]);

        $this->linkAttributeValues($variant, $data);
    }

    /**
     * Link attribute_* columns (e.g. attribute_color, attribute_size) to the variant.
     *
     * @param  array<string, mixed>  $row
     */
    private function linkAttributeValues(ProductVariant $variant, array $row): void
    {
        foreach ($row as $column => $value) {
            if (! str_starts_with($column, 'attribute_')) {
                continue;
            }

            if (empty($value)) {
                continue;
            }

            $attributeName = str_replace('_', ' ', mb_substr($column, 10));

            $attribute = Attribute::query()->firstOrCreate(
                ['slug' => Str::slug($attributeName)],
                [
                    'name' => ucfirst($attributeName),
                    'slug' => Str::slug($attributeName),
                    'is_filterable' => true,
                    'is_variant_selection' => true,
                    'position' => 0,
                ]
            );

            $attributeValue = AttributeValue::query()->firstOrCreate(
                ['attribute_id' => $attribute->id, 'value' => (string) $value],
                [
                    'attribute_id' => $attribute->id,
                    'value' => (string) $value,
                    'slug' => Str::slug((string) $value),
                    'position' => 0,
                ]
            );

            VariantAttributeValue::query()->firstOrCreate([
                'variant_id' => $variant->id,
                'attribute_id' => $attribute->id,
                'attribute_value_id' => $attributeValue->id,
            ]);
        }
    }
}
