<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AttributeTypeEnum;
use App\Models\Attribute;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\ProductFlag;
use App\Models\ProductVariant;
use App\Models\TaxRate;
use Database\Seeders\Concerns\CachesImages;
use Illuminate\Database\Seeder;

class DemoProductSeeder extends Seeder
{
    use CachesImages;

    public function run(): void
    {
        $this->seedTaxRate();
        $this->seedFlags();
        $brands = $this->seedBrands();

        $this->upsertSimpleProduct(
            slug: 'vitamin-c-serum',
            categorySlug: 'serums',
            brand: $brands['dermalab'],
            nameEn: 'Vitamin C Serum',
            namePl: 'Serum z witaminą C',
            shortDescription: 'Brightening serum for daily skincare routines.',
            description: 'Stabilised vitamin C serum with niacinamide for texture, tone, and glow.',
            sku: 'DL-SERUM-C-30',
            price: 6900,
            stock: 36,
            weight: 0.18,
            attributeValues: [
                'skin_type' => ['option' => 'sensitive'],
                'active_ingredients' => ['options' => ['vitamin-c', 'niacinamide']],
                'capacity_ml' => ['numeric' => '30'],
                'vegan' => ['boolean' => true],
                'organic' => ['boolean' => false],
                'country_of_origin' => ['text' => 'Poland'],
                'valid_until' => ['date' => '2027-06-30'],
            ],
            flagSlugs: ['new'],
        );

        $this->upsertSimpleProduct(
            slug: 'usb-c-30w-charger',
            categorySlug: 'electronics-accessories',
            brand: $brands['voltica'],
            nameEn: 'USB-C 30W Charger',
            namePl: 'Ładowarka USB-C 30W',
            shortDescription: 'Compact fast charger for phones, tablets, and travel kits.',
            description: 'GaN wall charger with a single USB-C output, stable thermals, and lightweight body.',
            sku: 'VT-CHG-30W',
            price: 11900,
            stock: 58,
            weight: 0.11,
            attributeValues: [
                'compatibility' => ['text' => 'Phones, tablets, earbuds, and USB-C accessories'],
                'power_w' => ['numeric' => '30'],
                'connector_type' => ['option' => 'usb-c'],
                'weight_g' => ['numeric' => '85'],
                'supported_devices' => ['options' => ['iphone', 'android', 'tablets', 'usb-c-laptops']],
                'wireless' => ['boolean' => false],
                'country_of_origin' => ['text' => 'Germany'],
            ],
            flagSlugs: ['bestseller'],
        );

        $this->upsertSimpleProduct(
            slug: 'cotton-shopping-bag',
            categorySlug: 'textile-accessories',
            brand: $brands['northloom'],
            nameEn: 'Cotton Shopping Bag',
            namePl: 'Bawełniana torba zakupowa',
            shortDescription: 'Heavyweight everyday tote for groceries, books, and commuting.',
            description: 'Organic cotton tote with reinforced handles and flat base for daily carry.',
            sku: 'NL-BAG-COTTON',
            price: 4900,
            stock: 72,
            weight: 0.22,
            attributeValues: [
                'material' => ['text' => 'Organic cotton canvas'],
                'country_of_origin' => ['text' => 'Poland'],
                'organic' => ['boolean' => true],
            ],
            flagSlugs: ['eco'],
        );

        $this->seedBulkCatalogProducts($brands);
    }

    protected function upsertSimpleProduct(
        string $slug,
        string $categorySlug,
        Brand $brand,
        string $nameEn,
        string $namePl,
        string $shortDescription,
        string $description,
        string $sku,
        int $price,
        int $stock,
        float $weight,
        array $attributeValues,
        array $flagSlugs = [],
    ): Product {
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

        ProductVariant::query()->updateOrCreate(
            ['product_id' => $product->id, 'sku' => $sku],
            [
                'name' => ['en' => 'Default', 'pl' => 'Domyślny'],
                'price' => $price,
                'cost_price' => (int) round($price * 0.55),
                'compare_at_price' => (int) round($price * 1.15),
                'weight' => $weight,
                'stock_quantity' => $stock,
                'stock_threshold' => 3,
                'is_active' => true,
                'is_default' => true,
                'position' => 1,
            ],
        );

        $this->syncProductAttributeValues($product, $attributeValues);
        $this->syncFlags($product, $flagSlugs);
        $this->ensureProductImages($product, $slug);

        return $product;
    }

    protected function syncProductAttributeValues(Product $product, array $values): void
    {
        foreach ($values as $attributeSlug => $payload) {
            $attribute = Attribute::query()->where('slug', $attributeSlug)->with('values')->firstOrFail();

            $attributes = match ($attribute->type) {
                AttributeTypeEnum::TEXT, AttributeTypeEnum::COLOR => [
                    'value_text' => $payload['text'] ?? null,
                    'value_numeric' => null,
                    'value_boolean' => null,
                    'value_date' => null,
                    'attribute_value_id' => null,
                    'value_json' => null,
                ],
                AttributeTypeEnum::NUMERIC => [
                    'value_text' => null,
                    'value_numeric' => $payload['numeric'] ?? null,
                    'value_boolean' => null,
                    'value_date' => null,
                    'attribute_value_id' => null,
                    'value_json' => null,
                ],
                AttributeTypeEnum::BOOLEAN => [
                    'value_text' => null,
                    'value_numeric' => null,
                    'value_boolean' => $payload['boolean'] ?? null,
                    'value_date' => null,
                    'attribute_value_id' => null,
                    'value_json' => null,
                ],
                AttributeTypeEnum::DATE => [
                    'value_text' => null,
                    'value_numeric' => null,
                    'value_boolean' => null,
                    'value_date' => $payload['date'] ?? null,
                    'attribute_value_id' => null,
                    'value_json' => null,
                ],
                AttributeTypeEnum::SELECT => [
                    'value_text' => null,
                    'value_numeric' => null,
                    'value_boolean' => null,
                    'value_date' => null,
                    'attribute_value_id' => $attribute->values->firstWhere('slug', $payload['option'])?->id,
                    'value_json' => null,
                ],
                AttributeTypeEnum::MULTISELECT => [
                    'value_text' => null,
                    'value_numeric' => null,
                    'value_boolean' => null,
                    'value_date' => null,
                    'attribute_value_id' => null,
                    'value_json' => $attribute->values
                        ->whereIn('slug', $payload['options'] ?? [])
                        ->pluck('id')
                        ->values()
                        ->all(),
                ],
            };

            ProductAttributeValue::query()->updateOrCreate(
                [
                    'product_id' => $product->id,
                    'attribute_id' => $attribute->id,
                ],
                $attributes,
            );
        }
    }

    protected function ensureProductImages(Product $product, string $seedPrefix): void
    {
        if ($product->images()->exists()) {
            return;
        }

        $this->addProductImages($product, $seedPrefix, 3);
    }

    protected function seedTaxRate(): void
    {
        $default = TaxRate::query()->updateOrCreate(
            ['rate' => 23, 'country_code' => 'PL'],
            ['name' => 'VAT 23%', 'is_active' => true, 'is_default' => true],
        );

        TaxRate::query()
            ->whereKeyNot($default->id)
            ->where('is_default', true)
            ->update(['is_default' => false]);
    }

    protected function seedFlags(): void
    {
        foreach ([
            ['slug' => 'new', 'name' => 'New', 'color' => '#2563EB', 'position' => 1],
            ['slug' => 'bestseller', 'name' => 'Bestseller', 'color' => '#059669', 'position' => 2],
            ['slug' => 'eco', 'name' => 'Eco', 'color' => '#16A34A', 'position' => 3],
        ] as $flag) {
            ProductFlag::query()->updateOrCreate(
                ['slug' => $flag['slug']],
                ['name' => $flag['name'], 'color' => $flag['color'], 'position' => $flag['position'], 'is_active' => true],
            );
        }
    }

    /**
     * @return array<string, Brand>
     */
    protected function seedBrands(): array
    {
        $definitions = [
            'dermalab' => ['name' => 'DermaLab', 'description' => 'Skincare developed for sensitive routines.'],
            'voltica' => ['name' => 'Voltica', 'description' => 'Compact power accessories for everyday electronics.'],
            'northloom' => ['name' => 'Northloom', 'description' => 'Textile essentials with durable construction.'],
        ];

        $brands = [];

        foreach ($definitions as $slug => $definition) {
            $brands[$slug] = Brand::query()->updateOrCreate(
                ['slug' => $slug],
                ['name' => $definition['name'], 'description' => $definition['description'], 'is_active' => true],
            );
        }

        return $brands;
    }

    /**
     * @param  list<string>  $flagSlugs
     */
    protected function syncFlags(Product $product, array $flagSlugs): void
    {
        $flagIds = ProductFlag::query()->whereIn('slug', $flagSlugs)->pluck('id')->all();
        $product->flags()->sync($flagIds);
    }

    /**
     * Seed additional catalog items for search, filters, and pagination tests.
     *
     * @param  array<string, Brand>  $brands
     */
    private function seedBulkCatalogProducts(array $brands): void
    {
        $this->seedCatalogBatch(
            categorySlug: 'serums',
            brand: $brands['dermalab'],
            nameEnPrefix: 'Radiant Serum',
            namePlPrefix: 'Serum rozświetlające',
            slugPrefix: 'radiant-serum',
            skuPrefix: 'DL-SER',
            count: 30,
            basePrice: 5900,
            priceStep: 120,
            baseStock: 18,
            weight: 0.16,
            weightStep: 0.004,
            attributeFactory: function (int $index): array {
                $skinTypes = ['dry', 'sensitive', 'normal', 'combination'];
                $ingredientSets = [
                    ['vitamin-c', 'niacinamide'],
                    ['hyaluronic-acid', 'ceramides'],
                    ['vitamin-c', 'hyaluronic-acid'],
                    ['ceramides', 'niacinamide'],
                ];

                return [
                    'skin_type' => ['option' => $skinTypes[$index % count($skinTypes)]],
                    'active_ingredients' => ['options' => $ingredientSets[$index % count($ingredientSets)]],
                    'capacity_ml' => ['numeric' => (string) (30 + (($index % 4) * 10))],
                    'vegan' => ['boolean' => $index % 3 !== 0],
                    'organic' => ['boolean' => $index % 5 === 0],
                    'country_of_origin' => ['text' => $index % 2 === 0 ? 'Poland' : 'France'],
                    'valid_until' => ['date' => sprintf('2027-12-%02d', ($index % 20) + 1)],
                ];
            },
            flagFactory: fn (int $index): array => $index % 9 === 0 ? ['new'] : [],
        );

        $this->seedCatalogBatch(
            categorySlug: 'face-creams',
            brand: $brands['dermalab'],
            nameEnPrefix: 'Comfort Cream',
            namePlPrefix: 'Krem komfortujący',
            slugPrefix: 'comfort-cream',
            skuPrefix: 'DL-CREAM',
            count: 30,
            basePrice: 6500,
            priceStep: 110,
            baseStock: 22,
            weight: 0.24,
            weightStep: 0.005,
            attributeFactory: function (int $index): array {
                $skinTypes = ['dry', 'sensitive', 'normal', 'combination'];
                $ingredientSets = [
                    ['hyaluronic-acid', 'ceramides'],
                    ['vitamin-c', 'niacinamide'],
                    ['ceramides', 'niacinamide'],
                    ['vitamin-c', 'hyaluronic-acid'],
                ];

                return [
                    'skin_type' => ['option' => $skinTypes[$index % count($skinTypes)]],
                    'active_ingredients' => ['options' => $ingredientSets[$index % count($ingredientSets)]],
                    'spf' => ['numeric' => (string) (15 + (($index % 4) * 5))],
                    'vegan' => ['boolean' => $index % 2 === 0],
                    'organic' => ['boolean' => $index % 4 === 0],
                    'country_of_origin' => ['text' => $index % 2 === 0 ? 'Poland' : 'Germany'],
                    'valid_until' => ['date' => sprintf('2027-11-%02d', ($index % 20) + 1)],
                ];
            },
            flagFactory: fn (int $index): array => $index % 8 === 0 ? ['eco'] : [],
        );

        $this->seedCatalogBatch(
            categorySlug: 'sun-protection',
            brand: $brands['dermalab'],
            nameEnPrefix: 'Sun Shield',
            namePlPrefix: 'Osłona SPF',
            slugPrefix: 'sun-shield',
            skuPrefix: 'DL-SPF',
            count: 30,
            basePrice: 7200,
            priceStep: 90,
            baseStock: 16,
            weight: 0.2,
            weightStep: 0.003,
            attributeFactory: function (int $index): array {
                $skinTypes = ['sensitive', 'dry', 'normal', 'combination'];

                return [
                    'skin_type' => ['option' => $skinTypes[$index % count($skinTypes)]],
                    'spf' => ['numeric' => (string) (30 + (($index % 3) * 10))],
                    'vegan' => ['boolean' => $index % 2 === 0],
                    'organic' => ['boolean' => false],
                    'country_of_origin' => ['text' => $index % 2 === 0 ? 'Spain' : 'Italy'],
                    'valid_until' => ['date' => sprintf('2028-03-%02d', ($index % 20) + 1)],
                ];
            },
            flagFactory: fn (int $index): array => $index % 10 === 0 ? ['new'] : [],
        );

        $this->seedCatalogBatch(
            categorySlug: 'electronics-accessories',
            brand: $brands['voltica'],
            nameEnPrefix: 'Power Dock',
            namePlPrefix: 'Stacja zasilania',
            slugPrefix: 'power-dock',
            skuPrefix: 'VT-ACC',
            count: 30,
            basePrice: 9900,
            priceStep: 140,
            baseStock: 28,
            weight: 0.12,
            weightStep: 0.002,
            attributeFactory: function (int $index): array {
                $compatibility = [
                    'Multi-device travel use',
                    'Phone, tablet, and earbuds',
                    'USB-C accessories',
                    'Home office setups',
                ];
                $deviceSets = [
                    ['iphone', 'android'],
                    ['android', 'tablets'],
                    ['iphone', 'usb-c-laptops'],
                    ['tablets', 'usb-c-laptops'],
                ];
                $connectorTypes = ['usb-c', 'lightning', 'bluetooth'];

                return [
                    'compatibility' => ['text' => $compatibility[$index % count($compatibility)]],
                    'power_w' => ['numeric' => (string) (20 + (($index % 4) * 10))],
                    'connector_type' => ['option' => $connectorTypes[$index % count($connectorTypes)]],
                    'weight_g' => ['numeric' => (string) (75 + (($index % 6) * 5))],
                    'supported_devices' => ['options' => $deviceSets[$index % count($deviceSets)]],
                    'wireless' => ['boolean' => $index % 4 === 0],
                    'country_of_origin' => ['text' => $index % 2 === 0 ? 'Germany' : 'China'],
                ];
            },
            flagFactory: fn (int $index): array => $index % 11 === 0 ? ['bestseller'] : [],
        );

        $this->seedCatalogBatch(
            categorySlug: 't-shirts',
            brand: $brands['northloom'],
            nameEnPrefix: 'Daily Tee',
            namePlPrefix: 'Koszulka codzienna',
            slugPrefix: 'daily-tee',
            skuPrefix: 'NL-TEE',
            count: 30,
            basePrice: 7900,
            priceStep: 80,
            baseStock: 24,
            weight: 0.22,
            weightStep: 0.002,
            attributeFactory: function (int $index): array {
                $materials = ['100% cotton', 'organic cotton', 'cotton blend', 'recycled cotton'];
                $genders = ['unisex', 'men', 'women'];
                $colors = ['Black', 'White', 'Beige', 'Blue'];

                return [
                    'material' => ['text' => $materials[$index % count($materials)]],
                    'gender' => ['option' => $genders[$index % count($genders)]],
                    'country_of_origin' => ['text' => $index % 2 === 0 ? 'Poland' : 'Portugal'],
                    'organic' => ['boolean' => $index % 4 === 1],
                    'color' => ['text' => $colors[$index % count($colors)]],
                ];
            },
            flagFactory: fn (int $index): array => $index % 8 === 0 ? ['new'] : [],
        );

        $this->seedCatalogBatch(
            categorySlug: 'hoodies',
            brand: $brands['northloom'],
            nameEnPrefix: 'Warm Hoodie',
            namePlPrefix: 'Ciepła bluza',
            slugPrefix: 'warm-hoodie',
            skuPrefix: 'NL-HDY',
            count: 30,
            basePrice: 11900,
            priceStep: 130,
            baseStock: 20,
            weight: 0.48,
            weightStep: 0.006,
            attributeFactory: function (int $index): array {
                $materials = ['organic cotton', 'cotton blend', 'recycled cotton', 'fleece'];
                $genders = ['unisex', 'men', 'women'];

                return [
                    'material' => ['text' => $materials[$index % count($materials)]],
                    'gender' => ['option' => $genders[$index % count($genders)]],
                    'country_of_origin' => ['text' => $index % 2 === 0 ? 'Poland' : 'Turkey'],
                    'organic' => ['boolean' => $index % 2 === 0],
                ];
            },
            flagFactory: fn (int $index): array => $index % 9 === 0 ? ['eco'] : [],
        );

        $this->seedCatalogBatch(
            categorySlug: 'shoes',
            brand: $brands['northloom'],
            nameEnPrefix: 'Urban Shoe',
            namePlPrefix: 'But miejski',
            slugPrefix: 'urban-shoe',
            skuPrefix: 'NL-SHOE',
            count: 30,
            basePrice: 14900,
            priceStep: 150,
            baseStock: 14,
            weight: 0.72,
            weightStep: 0.01,
            attributeFactory: function (int $index): array {
                $genders = ['unisex', 'men', 'women'];
                $materials = ['leather', 'suede', 'canvas', 'recycled textile'];

                return [
                    'material' => ['text' => $materials[$index % count($materials)]],
                    'gender' => ['option' => $genders[$index % count($genders)]],
                    'country_of_origin' => ['text' => $index % 2 === 0 ? 'Italy' : 'Spain'],
                    'waterproof' => ['boolean' => $index % 4 === 0],
                ];
            },
            flagFactory: fn (int $index): array => $index % 10 === 0 ? ['bestseller'] : [],
        );

        $this->seedCatalogBatch(
            categorySlug: 'textile-accessories',
            brand: $brands['northloom'],
            nameEnPrefix: 'Canvas Tote',
            namePlPrefix: 'Torba canvas',
            slugPrefix: 'canvas-tote',
            skuPrefix: 'NL-TOT',
            count: 30,
            basePrice: 3900,
            priceStep: 70,
            baseStock: 42,
            weight: 0.18,
            weightStep: 0.002,
            attributeFactory: function (int $index): array {
                $materials = ['Organic cotton canvas', 'Cotton canvas', 'Recycled cotton canvas'];

                return [
                    'material' => ['text' => $materials[$index % count($materials)]],
                    'country_of_origin' => ['text' => $index % 2 === 0 ? 'Poland' : 'India'],
                    'organic' => ['boolean' => $index % 3 !== 0],
                ];
            },
            flagFactory: fn (int $index): array => $index % 7 === 0 ? ['eco'] : [],
        );
    }

    /**
     * @param  callable(int): array<string, array<string, mixed>>  $attributeFactory
     * @param  callable(int): array<int, string>  $flagFactory
     */
    private function seedCatalogBatch(
        string $categorySlug,
        Brand $brand,
        string $nameEnPrefix,
        string $namePlPrefix,
        string $slugPrefix,
        string $skuPrefix,
        int $count,
        int $basePrice,
        int $priceStep,
        int $baseStock,
        float $weight,
        float $weightStep,
        callable $attributeFactory,
        callable $flagFactory,
    ): void {
        for ($i = 0; $i < $count; $i++) {
            $productNumber = $i + 1;

            $this->upsertSimpleProduct(
                slug: sprintf('%s-%03d', $slugPrefix, $productNumber),
                categorySlug: $categorySlug,
                brand: $brand,
                nameEn: sprintf('%s %03d', $nameEnPrefix, $productNumber),
                namePl: sprintf('%s %03d', $namePlPrefix, $productNumber),
                shortDescription: sprintf('%s %03d prepared for search and filter demos.', $nameEnPrefix, $productNumber),
                description: sprintf('%s %03d is a deterministic demo product for search, filtering, and pagination tests.', $nameEnPrefix, $productNumber),
                sku: sprintf('%s-%03d', $skuPrefix, $productNumber),
                price: $basePrice + (($i % 7) * $priceStep),
                stock: $baseStock + ($i % 12),
                weight: $weight + (($i % 5) * $weightStep),
                attributeValues: $attributeFactory($i),
                flagSlugs: $flagFactory($i),
            );
        }
    }
}
