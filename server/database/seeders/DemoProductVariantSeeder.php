<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\VariantAttributeValue;

class DemoProductVariantSeeder extends DemoProductSeeder
{
    public function run(): void
    {
        $brands = [
            'dermalab' => Brand::query()->where('slug', 'dermalab')->firstOrFail(),
            'voltica' => Brand::query()->where('slug', 'voltica')->firstOrFail(),
            'northloom' => Brand::query()->where('slug', 'northloom')->firstOrFail(),
        ];

        $this->upsertVariantProduct(
            slug: 'hydrating-face-cream',
            categorySlug: 'face-creams',
            brand: $brands['dermalab'],
            nameEn: 'Hydrating Face Cream',
            namePl: 'Krem nawilżający',
            shortDescription: 'Barrier-supporting cream with multiple size variants.',
            description: 'Daily moisturiser with ceramides and hyaluronic acid for dry or reactive skin.',
            attributeValues: [
                'skin_type' => ['option' => 'dry'],
                'active_ingredients' => ['options' => ['hyaluronic-acid', 'ceramides']],
                'spf' => ['numeric' => '30'],
                'vegan' => ['boolean' => true],
                'country_of_origin' => ['text' => 'Poland'],
            ],
            variants: [
                ['sku' => 'DL-CREAM-50', 'label_en' => '50 ml', 'label_pl' => '50 ml', 'price' => 5900, 'stock' => 24, 'weight' => 0.21, 'options' => ['volume' => '50-ml'], 'is_default' => true],
                ['sku' => 'DL-CREAM-100', 'label_en' => '100 ml', 'label_pl' => '100 ml', 'price' => 8900, 'stock' => 18, 'weight' => 0.32, 'options' => ['volume' => '100-ml'], 'is_default' => false],
                ['sku' => 'DL-CREAM-250', 'label_en' => '250 ml', 'label_pl' => '250 ml', 'price' => 14900, 'stock' => 10, 'weight' => 0.48, 'options' => ['volume' => '250-ml'], 'is_default' => false],
            ],
            flagSlugs: ['bestseller'],
        );

        $this->upsertVariantProduct(
            slug: 'basic-t-shirt',
            categorySlug: 't-shirts',
            brand: $brands['northloom'],
            nameEn: 'Basic T-Shirt',
            namePl: 'T-shirt basic',
            shortDescription: 'Core wardrobe tee with color and size variants.',
            description: 'Heavyweight everyday T-shirt with structured collar and clean fit.',
            attributeValues: [
                'material' => ['text' => '100% cotton'],
                'gender' => ['option' => 'unisex'],
                'country_of_origin' => ['text' => 'Poland'],
            ],
            variants: [
                ['sku' => 'NL-TS-BLK-S', 'label_en' => 'Black / S', 'label_pl' => 'Czarny / S', 'price' => 7900, 'stock' => 20, 'weight' => 0.28, 'options' => ['color' => 'black', 'size' => 's'], 'is_default' => true],
                ['sku' => 'NL-TS-BLK-M', 'label_en' => 'Black / M', 'label_pl' => 'Czarny / M', 'price' => 7900, 'stock' => 18, 'weight' => 0.29, 'options' => ['color' => 'black', 'size' => 'm'], 'is_default' => false],
                ['sku' => 'NL-TS-BLK-L', 'label_en' => 'Black / L', 'label_pl' => 'Czarny / L', 'price' => 7900, 'stock' => 14, 'weight' => 0.3, 'options' => ['color' => 'black', 'size' => 'l'], 'is_default' => false],
                ['sku' => 'NL-TS-WHT-S', 'label_en' => 'White / S', 'label_pl' => 'Biały / S', 'price' => 7900, 'stock' => 16, 'weight' => 0.28, 'options' => ['color' => 'white', 'size' => 's'], 'is_default' => false],
                ['sku' => 'NL-TS-WHT-M', 'label_en' => 'White / M', 'label_pl' => 'Biały / M', 'price' => 7900, 'stock' => 15, 'weight' => 0.29, 'options' => ['color' => 'white', 'size' => 'm'], 'is_default' => false],
                ['sku' => 'NL-TS-WHT-L', 'label_en' => 'White / L', 'label_pl' => 'Biały / L', 'price' => 7900, 'stock' => 11, 'weight' => 0.3, 'options' => ['color' => 'white', 'size' => 'l'], 'is_default' => false],
            ],
            flagSlugs: ['new'],
        );

        $this->upsertVariantProduct(
            slug: 'wireless-headphones',
            categorySlug: 'headphones',
            brand: $brands['voltica'],
            nameEn: 'Wireless Headphones',
            namePl: 'Słuchawki bezprzewodowe',
            shortDescription: 'Noise-cancelling headphones with two editions and two colors.',
            description: 'Over-ear wireless headphones with USB-C charging and commuter-friendly tuning.',
            attributeValues: [
                'wireless' => ['boolean' => true],
                'waterproof' => ['boolean' => true],
                'connector_type' => ['option' => 'usb-c'],
                'features' => ['options' => ['anc', 'fast-charging']],
                'supported_devices' => ['options' => ['iphone', 'android', 'tablets']],
                'release_date' => ['date' => '2026-03-15'],
                'country_of_origin' => ['text' => 'Japan'],
            ],
            variants: [
                ['sku' => 'VT-HP-BLK-STD', 'label_en' => 'Black / Standard', 'label_pl' => 'Czarny / Standard', 'price' => 34900, 'stock' => 12, 'weight' => 0.42, 'options' => ['color' => 'black', 'edition' => 'standard'], 'is_default' => true],
                ['sku' => 'VT-HP-WHT-STD', 'label_en' => 'White / Standard', 'label_pl' => 'Biały / Standard', 'price' => 34900, 'stock' => 9, 'weight' => 0.42, 'options' => ['color' => 'white', 'edition' => 'standard'], 'is_default' => false],
                ['sku' => 'VT-HP-BLK-PRO', 'label_en' => 'Black / Pro', 'label_pl' => 'Czarny / Pro', 'price' => 42900, 'stock' => 7, 'weight' => 0.44, 'options' => ['color' => 'black', 'edition' => 'pro'], 'is_default' => false],
                ['sku' => 'VT-HP-WHT-PRO', 'label_en' => 'White / Pro', 'label_pl' => 'Biały / Pro', 'price' => 42900, 'stock' => 6, 'weight' => 0.44, 'options' => ['color' => 'white', 'edition' => 'pro'], 'is_default' => false],
            ],
            flagSlugs: ['bestseller'],
        );
    }

    /**
     * @param  array<string, array<string, mixed>>  $attributeValues
     * @param  list<array{sku: string, label_en: string, label_pl: string, price: int, stock: int, weight: float, options: array<string, string>, is_default: bool}>  $variants
     * @param  list<string>  $flagSlugs
     */
    private function upsertVariantProduct(
        string $slug,
        string $categorySlug,
        Brand $brand,
        string $nameEn,
        string $namePl,
        string $shortDescription,
        string $description,
        array $attributeValues,
        array $variants,
        array $flagSlugs = [],
    ): void {
        $category = Category::query()->where('slug->en', $categorySlug)->firstOrFail();

        $product = Product::query()->firstOrNew(['slug->en' => $slug]);
        $product->fill([
            'product_type_id' => $category->product_type_id,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'name' => ['en' => $nameEn, 'pl' => $namePl],
            'slug' => ['en' => $slug, 'pl' => $slug],
            'short_description' => ['en' => $shortDescription, 'pl' => $namePl],
            'description' => ['en' => $description, 'pl' => $description],
            'is_active' => true,
            'is_saleable' => true,
            'seo_title' => $nameEn.' Demo Product',
            'seo_description' => $shortDescription,
            'meta_robots' => 'index, follow',
            'og_image' => '/demo/products/catalog-product.svg',
        ]);
        $product->save();

        $product->categories()->syncWithoutDetaching([$category->id]);
        $this->syncProductAttributeValues($product, $attributeValues);
        $this->syncFlags($product, $flagSlugs);
        $this->ensureProductImages($product, $slug);

        $variantIds = [];

        foreach ($variants as $position => $variantDefinition) {
            $variant = ProductVariant::query()->updateOrCreate(
                ['product_id' => $product->id, 'sku' => $variantDefinition['sku']],
                [
                    'name' => ['en' => $variantDefinition['label_en'], 'pl' => $variantDefinition['label_pl']],
                    'price' => $variantDefinition['price'],
                    'cost_price' => (int) round($variantDefinition['price'] * 0.55),
                    'compare_at_price' => (int) round($variantDefinition['price'] * 1.12),
                    'weight' => $variantDefinition['weight'],
                    'stock_quantity' => $variantDefinition['stock'],
                    'stock_threshold' => 2,
                    'is_active' => true,
                    'is_default' => $variantDefinition['is_default'],
                    'position' => $position + 1,
                ],
            );

            $variantIds[] = $variant->id;
            $this->syncVariantAttributeValues($variant, $variantDefinition['options']);
        }

        ProductVariant::query()
            ->where('product_id', $product->id)
            ->whereNotIn('id', $variantIds)
            ->delete();
    }

    /**
     * @param  array<string, string>  $options
     */
    private function syncVariantAttributeValues(ProductVariant $variant, array $options): void
    {
        $attributeIds = [];

        foreach ($options as $attributeSlug => $optionSlug) {
            $attribute = Attribute::query()->where('slug', $attributeSlug)->firstOrFail();
            $option = AttributeValue::query()
                ->where('attribute_id', $attribute->id)
                ->where('slug', $optionSlug)
                ->firstOrFail();

            $attributeIds[] = $attribute->id;

            VariantAttributeValue::query()->updateOrCreate(
                [
                    'variant_id' => $variant->id,
                    'attribute_id' => $attribute->id,
                ],
                ['attribute_value_id' => $option->id],
            );
        }

        VariantAttributeValue::query()
            ->where('variant_id', $variant->id)
            ->whereNotIn('attribute_id', $attributeIds)
            ->delete();
    }
}
