<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AttributeTypeEnum;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\PriceHistory;
use App\Models\Product;
use App\Models\ProductFlag;
use App\Models\ProductType;
use App\Models\ProductTypeAttribute;
use App\Models\ProductVariant;
use App\Models\TaxRate;
use App\Models\VariantAttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class EcommerceDemoSeeder extends Seeder
{
    public function run(): void
    {
        $taxRate = $this->seedTaxRates();
        $brands = $this->seedBrands();
        $attributes = $this->seedAttributes();
        $productTypes = $this->seedProductTypes($attributes);
        $categories = $this->seedCategories($productTypes);
        $flags = $this->seedFlags();

        $this->seedProducts($taxRate, $brands, $attributes, $productTypes, $categories, $flags);
    }

    // ── Tax Rates ─────────────────────────────────────────────────────────────

    private function seedTaxRates(): TaxRate
    {
        $default = TaxRate::query()->updateOrCreate(
            ['rate' => 23, 'country_code' => 'PL'],
            ['name' => 'VAT 23%', 'is_active' => true, 'is_default' => true],
        );

        TaxRate::query()->updateOrCreate(
            ['rate' => 8, 'country_code' => 'PL'],
            ['name' => 'VAT 8%', 'is_active' => true, 'is_default' => false],
        );

        TaxRate::query()->updateOrCreate(
            ['rate' => 5, 'country_code' => 'PL'],
            ['name' => 'VAT 5%', 'is_active' => true, 'is_default' => false],
        );

        TaxRate::query()
            ->where('id', '!=', $default->id)
            ->where('is_default', true)
            ->update(['is_default' => false]);

        return $default;
    }

    // ── Brands ────────────────────────────────────────────────────────────────

    private function seedBrands(): Collection
    {
        $data = [
            ['name' => 'Northstar', 'description' => 'Premium urban essentials for everyday life.', 'position' => 1],
            ['name' => 'Aurelia', 'description' => 'Modern fashion with a timeless edge.', 'position' => 2],
            ['name' => 'Crafted Co', 'description' => 'Handcrafted goods made with love and precision.', 'position' => 3],
            ['name' => 'Mono Works', 'description' => 'Minimalist design for the modern home.', 'position' => 4],
            ['name' => 'Vitalis', 'description' => 'Science-backed beauty and wellness products.', 'position' => 5],
            ['name' => 'Kinetic', 'description' => 'Performance gear for the active lifestyle.', 'position' => 6],
        ];

        return collect($data)->mapWithKeys(function (array $brand): array {
            $model = Brand::query()->updateOrCreate(
                ['slug' => Str::slug($brand['name'])],
                [
                    'name' => $brand['name'],
                    'description' => $brand['description'],
                    'is_active' => true,
                    'position' => $brand['position'],
                ],
            );

            return [$model->slug => $model];
        });
    }

    // ── Attributes ────────────────────────────────────────────────────────────

    private function seedAttributes(): array
    {
        $color = Attribute::query()->updateOrCreate(
            ['slug' => 'color'],
            ['name' => 'Color', 'type' => AttributeTypeEnum::COLOR, 'is_variant_selection' => true, 'is_filterable' => true, 'position' => 1],
        );

        $colorValues = collect([
            ['name' => 'Black',  'hex' => '#111827'],
            ['name' => 'White',  'hex' => '#F9FAFB'],
            ['name' => 'Navy',   'hex' => '#1E3A8A'],
            ['name' => 'Sand',   'hex' => '#D6C6A5'],
            ['name' => 'Olive',  'hex' => '#4D5645'],
            ['name' => 'Slate',  'hex' => '#64748B'],
            ['name' => 'Terracotta', 'hex' => '#C27457'],
            ['name' => 'Forest', 'hex' => '#1A472A'],
            ['name' => 'Cream',  'hex' => '#FFFDD0'],
            ['name' => 'Blush',  'hex' => '#F4A7A3'],
        ])->mapWithKeys(function (array $v, int $i) use ($color): array {
            $model = AttributeValue::query()->updateOrCreate(
                ['attribute_id' => $color->id, 'slug' => Str::slug($v['name'])],
                ['value' => $v['name'], 'color_hex' => $v['hex'], 'position' => $i + 1],
            );

            return [$model->slug => $model];
        });

        $size = Attribute::query()->updateOrCreate(
            ['slug' => 'size'],
            ['name' => 'Size', 'type' => AttributeTypeEnum::SELECT, 'is_variant_selection' => true, 'is_filterable' => true, 'position' => 2],
        );

        $sizeValues = collect(['XS', 'S', 'M', 'L', 'XL', 'XXL'])->mapWithKeys(function (string $v, int $i) use ($size): array {
            $model = AttributeValue::query()->updateOrCreate(
                ['attribute_id' => $size->id, 'slug' => Str::slug($v)],
                ['value' => $v, 'position' => $i + 1],
            );

            return [$model->slug => $model];
        });

        $shoeSize = Attribute::query()->updateOrCreate(
            ['slug' => 'shoe-size'],
            ['name' => 'Shoe Size', 'type' => AttributeTypeEnum::SELECT, 'is_variant_selection' => true, 'is_filterable' => true, 'position' => 3],
        );

        $shoeSizeValues = collect(['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'])->mapWithKeys(function (string $v, int $i) use ($shoeSize): array {
            $model = AttributeValue::query()->updateOrCreate(
                ['attribute_id' => $shoeSize->id, 'slug' => 'eu-'.$v],
                ['value' => $v, 'position' => $i + 1],
            );

            return [$model->slug => $model];
        });

        $scent = Attribute::query()->updateOrCreate(
            ['slug' => 'scent'],
            ['name' => 'Scent', 'type' => AttributeTypeEnum::SELECT, 'is_variant_selection' => true, 'is_filterable' => false, 'position' => 4],
        );

        $scentValues = collect(['Lavender', 'Rose', 'Eucalyptus', 'Vanilla', 'Unscented'])->mapWithKeys(function (string $v, int $i) use ($scent): array {
            $model = AttributeValue::query()->updateOrCreate(
                ['attribute_id' => $scent->id, 'slug' => Str::slug($v)],
                ['value' => $v, 'position' => $i + 1],
            );

            return [$model->slug => $model];
        });

        return ['color' => $color, 'colorValues' => $colorValues, 'size' => $size, 'sizeValues' => $sizeValues, 'shoeSize' => $shoeSize, 'shoeSizeValues' => $shoeSizeValues, 'scent' => $scent, 'scentValues' => $scentValues];
    }

    // ── Product Types ─────────────────────────────────────────────────────────

    private function seedProductTypes(array $attrs): Collection
    {
        $definitions = [
            ['name' => 'Clothing',     'slug' => 'clothing',     'has_variants' => true,  'attr_slugs' => ['color', 'size']],
            ['name' => 'Footwear',     'slug' => 'footwear',     'has_variants' => true,  'attr_slugs' => ['color', 'shoe-size']],
            ['name' => 'Accessories',  'slug' => 'accessories',  'has_variants' => true,  'attr_slugs' => ['color']],
            ['name' => 'Home Decor',   'slug' => 'home-decor',   'has_variants' => false, 'attr_slugs' => []],
            ['name' => 'Kitchenware',  'slug' => 'kitchenware',  'has_variants' => false, 'attr_slugs' => []],
            ['name' => 'Beauty',       'slug' => 'beauty',       'has_variants' => true,  'attr_slugs' => ['scent']],
            ['name' => 'Sport',        'slug' => 'sport',        'has_variants' => false, 'attr_slugs' => []],
        ];

        $attributeBySlug = [
            'color' => $attrs['color'],
            'size' => $attrs['size'],
            'shoe-size' => $attrs['shoeSize'],
            'scent' => $attrs['scent'],
        ];

        return collect($definitions)->mapWithKeys(function (array $def) use ($attributeBySlug): array {
            $type = ProductType::query()->updateOrCreate(
                ['slug' => $def['slug']],
                [
                    'name' => $def['name'],
                    'has_variants' => $def['has_variants'],
                    'is_shippable' => true,
                    'variant_selection_attributes' => $def['attr_slugs'],
                ],
            );

            foreach ($def['attr_slugs'] as $pos => $attrSlug) {
                $attribute = $attributeBySlug[$attrSlug];
                ProductTypeAttribute::query()->updateOrCreate(
                    ['product_type_id' => $type->id, 'attribute_id' => $attribute->id],
                    ['is_required' => true, 'position' => $pos + 1],
                );
            }

            return [$type->slug => $type];
        });
    }

    // ── Categories ────────────────────────────────────────────────────────────

    private function seedCategories(Collection $productTypes): Collection
    {
        $result = collect();

        $parents = [
            ['slug' => 'fashion',         'en' => 'Fashion',           'pl' => 'Moda',                  'position' => 1],
            ['slug' => 'home-living',     'en' => 'Home & Living',     'pl' => 'Dom i Życie',            'position' => 2],
            ['slug' => 'beauty-wellness', 'en' => 'Beauty & Wellness', 'pl' => 'Uroda i Wellness',       'position' => 3],
            ['slug' => 'sport-outdoor',   'en' => 'Sport & Outdoor',   'pl' => 'Sport i Outdoor',        'position' => 4],
        ];

        foreach ($parents as $p) {
            $model = Category::query()->updateOrCreate(
                ['slug' => $p['slug']],
                ['name' => ['en' => $p['en'], 'pl' => $p['pl']], 'parent_id' => null, 'is_active' => true, 'position' => $p['position']],
            );
            $result[$p['slug']] = $model;
        }

        $children = [
            // Fashion children
            ['slug' => 'mens-clothing',    'en' => "Men's Clothing",     'pl' => 'Odzież Męska',           'parent' => 'fashion',         'type' => 'clothing',    'pos' => 1],
            ['slug' => 'womens-clothing',  'en' => "Women's Clothing",   'pl' => 'Odzież Damska',          'parent' => 'fashion',         'type' => 'clothing',    'pos' => 2],
            ['slug' => 'kids-clothing',    'en' => "Kids' Clothing",     'pl' => 'Odzież Dziecięca',       'parent' => 'fashion',         'type' => 'clothing',    'pos' => 3],
            ['slug' => 'footwear',         'en' => 'Footwear',           'pl' => 'Obuwie',                 'parent' => 'fashion',         'type' => 'footwear',    'pos' => 4],
            ['slug' => 'bags-accessories', 'en' => 'Bags & Accessories', 'pl' => 'Torebki i Akcesoria',   'parent' => 'fashion',         'type' => 'accessories', 'pos' => 5],
            // Home & Living children
            ['slug' => 'living-room',      'en' => 'Living Room',        'pl' => 'Salon',                  'parent' => 'home-living',     'type' => 'home-decor',  'pos' => 1],
            ['slug' => 'bedroom',          'en' => 'Bedroom',            'pl' => 'Sypialnia',              'parent' => 'home-living',     'type' => 'home-decor',  'pos' => 2],
            ['slug' => 'kitchen-dining',   'en' => 'Kitchen & Dining',   'pl' => 'Kuchnia i Jadalnia',     'parent' => 'home-living',     'type' => 'kitchenware', 'pos' => 3],
            ['slug' => 'bathroom',         'en' => 'Bathroom',           'pl' => 'Łazienka',               'parent' => 'home-living',     'type' => 'home-decor',  'pos' => 4],
            // Beauty children
            ['slug' => 'skincare',         'en' => 'Skincare',           'pl' => 'Pielęgnacja Skóry',      'parent' => 'beauty-wellness', 'type' => 'beauty',      'pos' => 1],
            ['slug' => 'body-care',        'en' => 'Body Care',          'pl' => 'Pielęgnacja Ciała',      'parent' => 'beauty-wellness', 'type' => 'beauty',      'pos' => 2],
            ['slug' => 'hair-care',        'en' => 'Hair Care',          'pl' => 'Pielęgnacja Włosów',     'parent' => 'beauty-wellness', 'type' => 'beauty',      'pos' => 3],
            // Sport children
            ['slug' => 'activewear',       'en' => 'Activewear',         'pl' => 'Odzież Sportowa',        'parent' => 'sport-outdoor',   'type' => 'clothing',    'pos' => 1],
            ['slug' => 'sport-equipment',  'en' => 'Equipment',          'pl' => 'Sprzęt Sportowy',        'parent' => 'sport-outdoor',   'type' => 'sport',       'pos' => 2],
        ];

        foreach ($children as $c) {
            $parent = $result[$c['parent']];
            $type = $productTypes->get($c['type']);
            $model = Category::query()->updateOrCreate(
                ['slug' => $c['slug']],
                [
                    'name' => ['en' => $c['en'], 'pl' => $c['pl']],
                    'parent_id' => $parent->id,
                    'product_type_id' => $type?->id,
                    'is_active' => true,
                    'position' => $c['pos'],
                ],
            );
            $result[$c['slug']] = $model;
        }

        return $result;
    }

    // ── Flags ─────────────────────────────────────────────────────────────────

    private function seedFlags(): Collection
    {
        return collect([
            ['name' => 'New',        'slug' => 'new',        'color' => '#2563EB', 'position' => 1],
            ['name' => 'Bestseller', 'slug' => 'bestseller', 'color' => '#059669', 'position' => 2],
            ['name' => 'Sale',       'slug' => 'sale',       'color' => '#DC2626', 'position' => 3],
            ['name' => 'Eco',        'slug' => 'eco',        'color' => '#16A34A', 'position' => 4],
            ['name' => 'Limited',    'slug' => 'limited',    'color' => '#7C3AED', 'position' => 5],
        ])->mapWithKeys(function (array $f): array {
            $model = ProductFlag::query()->updateOrCreate(
                ['slug' => $f['slug']],
                ['name' => $f['name'], 'color' => $f['color'], 'position' => $f['position'], 'is_active' => true],
            );

            return [$model->slug => $model];
        });
    }

    // ── Products ──────────────────────────────────────────────────────────────

    private function seedProducts(
        TaxRate $taxRate,
        Collection $brands,
        array $attrs,
        Collection $productTypes,
        Collection $categories,
        Collection $flags,
    ): void {
        foreach ($this->productDefinitions() as $item) {
            $category = $categories->get($item['category']);
            $type = $productTypes->get($item['type']);
            $brand = $brands->get(Str::slug($item['brand']));
            if (! $category) {
                continue;
            }

            if (! $type) {
                continue;
            }

            $namePl = $item['name_pl'] ?? $item['name'];
            $existing = Product::query()->where('name->en', $item['name'])->first();
            $slug = $existing?->slug ?? Str::slug($item['name']).'-'.Str::lower(Str::random(4));

            $product = Product::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => ['en' => $item['name'], 'pl' => $namePl],
                    'product_type_id' => $type->id,
                    'category_id' => $category->id,
                    'brand_id' => $brand?->id,
                    'description' => $this->generateDescription($item['name'], $namePl),
                    'short_description' => [
                        'en' => $item['short_description'] ?? $item['name'].' — quality craftsmanship for everyday use.',
                        'pl' => $item['short_description_pl'] ?? $namePl.' — najwyższa jakość na co dzień.',
                    ],
                    'sku_prefix' => mb_strtoupper(Str::substr(Str::slug($item['name']), 0, 4)),
                    'is_active' => true,
                    'is_saleable' => true,
                ],
            );

            $product->categories()->syncWithoutDetaching([$category->id]);

            $itemFlags = collect($item['flags'] ?? [])
                ->map(fn (string $s): int => $flags->get($s)->id)
                ->filter()
                ->all();
            $product->flags()->sync($itemFlags);
            $product->variants()->delete();

            $this->createVariants($product, $type, $taxRate, $item['base_price'], $attrs, $item);
        }
    }

    private function createVariants(
        Product $product,
        ProductType $type,
        TaxRate $taxRate,
        int $basePrice,
        array $attrs,
        array $item,
    ): void {
        $definitions = $this->variantDefinitions($type->slug, $attrs, $item);

        foreach ($definitions as $pos => $def) {
            $variant = ProductVariant::query()->create([
                'product_id' => $product->id,
                'tax_rate_id' => $taxRate->id,
                'sku' => sprintf('%s-%04d-%d', mb_strtoupper($product->sku_prefix ?? 'SKU'), $product->id, $pos + 1),
                'name' => [
                    'en' => sprintf('%s %s', $product->getTranslation('name', 'en'), $def['label']),
                    'pl' => sprintf('%s %s', $product->getTranslation('name', 'pl'), $def['label']),
                ],
                'price' => $basePrice + ($def['price_delta'] ?? 0),
                'cost_price' => (int) round(($basePrice + ($def['price_delta'] ?? 0)) * 0.55),
                'compare_at_price' => isset($item['has_compare']) && $item['has_compare']
                    ? (int) round(($basePrice + ($def['price_delta'] ?? 0)) * 1.25)
                    : null,
                'weight' => $def['weight'] ?? 0.5,
                'stock_quantity' => $def['stock'] ?? random_int(8, 35),
                'stock_threshold' => 5,
                'is_active' => true,
                'is_default' => $pos === 0,
                'position' => $pos,
            ]);

            foreach ($def['attribute_values'] as $attrId => $valueId) {
                VariantAttributeValue::query()->create([
                    'variant_id' => $variant->id,
                    'attribute_id' => $attrId,
                    'attribute_value_id' => $valueId,
                ]);
            }

            // Seed price history for on-sale products (EU Omnibus Directive demo data).
            //
            // Strategy: record 4–9 price points spread over the last 90 days.
            // All entries within the last 30 days have prices ABOVE the current
            // sale price, so lowestPriceInLast30Days() returns a meaningful
            // intermediate price — not the current price — making the omnibus
            // label ("Lowest in last 30 days: €X") visually useful.
            if (isset($item['has_compare']) && $item['has_compare'] && $variant->compare_at_price) {
                $comparePrice = $variant->compare_at_price; // e.g. 12499
                $salePrice = $variant->price;            // e.g. 9999
                // Gap between RRP and sale price to interpolate through
                $gap = $comparePrice - $salePrice;

                // Remove the entry auto-created by ProductVariantPriceObserver
                // on variant creation — it records the current sale price at now(),
                // which would make lowestPriceInLast30Days() return the sale price
                // itself and suppress the omnibus label.
                $variant->priceHistory()->where('recorded_at', '>=', today())->delete();

                // ── Entries older than 30 days (outside omnibus window) ──────
                // 3–5 records at or near the RRP, 35–90 days ago
                $oldCount = random_int(3, 5);
                for ($i = 0; $i < $oldCount; $i++) {
                    $daysAgo = random_int(35 + $i * 8, 50 + $i * 10);
                    // Slight random variation around the RRP (±3 %)
                    $price = (int) round($comparePrice * (1 + (random_int(-3, 3) / 100)));
                    PriceHistory::query()->create([
                        'product_variant_id' => $variant->id,
                        'price' => $price,
                        'recorded_at' => now()->subDays($daysAgo),
                    ]);
                }

                // ── Entries within the last 30 days (inside omnibus window) ─
                // 1–4 records showing a gradual price drop toward the sale,
                // but all still ABOVE the current sale price.
                $recentCount = random_int(1, 4);
                for ($j = 0; $j < $recentCount; $j++) {
                    // Space them evenly from day 29 down to day 5
                    $daysAgo = (int) round(29 - ($j * (24 / max($recentCount, 1))));
                    $daysAgo = max(5, $daysAgo);
                    // Interpolate price: starts near compare, ends at salePrice + 10 %
                    $ratio = ($j + 1) / ($recentCount + 1);
                    $price = (int) round($comparePrice - $gap * $ratio * 0.8);
                    $price = max($price, (int) round($salePrice * 1.08)); // always ≥ sale+8 %
                    PriceHistory::query()->create([
                        'product_variant_id' => $variant->id,
                        'price' => $price,
                        'recorded_at' => now()->subDays($daysAgo),
                    ]);
                }

                // NOTE: the current sale price is intentionally NOT recorded.
                // lowestPriceInLast30Days() falls back to $variant->price when
                // price_history has no entry <= $salePrice in the window, so the
                // omnibus label shows the lowest intermediate price instead.
            }
        }
    }

    private function variantDefinitions(string $typeSlug, array $attrs, array $item): array
    {
        $cv = $attrs['colorValues'];
        $sv = $attrs['sizeValues'];
        $shv = $attrs['shoeSizeValues'];
        $scv = $attrs['scentValues'];
        $cId = $attrs['color']->id;
        $sId = $attrs['size']->id;
        $shId = $attrs['shoeSize']->id;
        $scId = $attrs['scent']->id;

        // Colours used per product (first 2 from item or default)
        $colors = $item['colors'] ?? ['black', 'navy'];
        // Sizes used (first 2)
        $sizes = $item['sizes'] ?? ['s', 'm'];

        return match ($typeSlug) {
            'clothing' => [
                ['label' => Str::upper($colors[0]).'/'.$sizes[0], 'price_delta' => 0,    'attribute_values' => [$cId => $cv->get($colors[0])->id, $sId => $sv->get($sizes[0])->id]],
                ['label' => Str::upper($colors[0]).'/'.$sizes[1], 'price_delta' => 0,    'attribute_values' => [$cId => $cv->get($colors[0])->id, $sId => $sv->get($sizes[1])->id]],
                ['label' => Str::upper($colors[1]).'/'.$sizes[0], 'price_delta' => 1000, 'attribute_values' => [$cId => $cv->get($colors[1])->id, $sId => $sv->get($sizes[0])->id]],
                ['label' => Str::upper($colors[1]).'/'.$sizes[1], 'price_delta' => 1000, 'attribute_values' => [$cId => $cv->get($colors[1])->id, $sId => $sv->get($sizes[1])->id]],
            ],

            'footwear' => [
                ['label' => Str::ucfirst($colors[0]).' EU41', 'price_delta' => 0,    'attribute_values' => [$cId => $cv->get($colors[0])->id, $shId => $shv->get('eu-41')->id]],
                ['label' => Str::ucfirst($colors[0]).' EU42', 'price_delta' => 0,    'attribute_values' => [$cId => $cv->get($colors[0])->id, $shId => $shv->get('eu-42')->id]],
                ['label' => Str::ucfirst($colors[1]).' EU41', 'price_delta' => 500,  'attribute_values' => [$cId => $cv->get($colors[1])->id, $shId => $shv->get('eu-41')->id]],
                ['label' => Str::ucfirst($colors[1]).' EU42', 'price_delta' => 500,  'attribute_values' => [$cId => $cv->get($colors[1])->id, $shId => $shv->get('eu-42')->id]],
            ],

            'accessories' => [
                ['label' => Str::ucfirst($colors[0]), 'price_delta' => 0,   'attribute_values' => [$cId => $cv->get($colors[0])->id]],
                ['label' => Str::ucfirst($colors[1]), 'price_delta' => 500, 'attribute_values' => [$cId => $cv->get($colors[1])->id]],
            ],

            'beauty' => [
                ['label' => 'Lavender',   'price_delta' => 0,   'attribute_values' => [$scId => $scv->get('lavender')->id]],
                ['label' => 'Rose',       'price_delta' => 200, 'attribute_values' => [$scId => $scv->get('rose')->id]],
                ['label' => 'Unscented',  'price_delta' => 0,   'attribute_values' => [$scId => $scv->get('unscented')->id]],
            ],

            // home-decor, kitchenware, sport — single default variant
            default => [
                ['label' => 'Default', 'price_delta' => 0, 'weight' => $item['weight'] ?? 1.0, 'stock' => random_int(10, 40), 'attribute_values' => []],
            ],
        };
    }

    private function generateDescription(string $nameEn, string $namePl): array
    {
        return [
            'en' => sprintf(
                '<p>%s is crafted with attention to detail and premium materials. Designed for everyday use, it combines functionality with modern aesthetics to fit seamlessly into your lifestyle.</p><p>Each piece undergoes rigorous quality control to ensure lasting durability and consistent performance. Whether you\'re looking for comfort, style, or practicality — this delivers on every front.</p>',
                $nameEn,
            ),
            'pl' => sprintf(
                '<p>%s wykonany jest z dbałością o szczegóły i najwyższej jakości materiałów. Zaprojektowany z myślą o codziennym użytkowaniu, łączy funkcjonalność z nowoczesną estetyką.</p><p>Każdy produkt przechodzi rygorystyczną kontrolę jakości, aby zapewnić trwałość i niezawodność. Niezależnie czy szukasz komfortu, stylu czy praktyczności — tu znajdziesz wszystko.</p>',
                $namePl,
            ),
        ];
    }

    // ── Product Definitions (100 products) ───────────────────────────────────

    private function productDefinitions(): array
    {
        return [
            // ── Men's Clothing (14) ───────────────────────────────────────────
            ['name' => 'Essential Cotton Tee',      'name_pl' => 'Bawełniany T-shirt Basic',           'category' => 'mens-clothing',    'brand' => 'Northstar',   'type' => 'clothing',    'base_price' => 4999,  'flags' => ['new'],                  'colors' => ['black', 'navy'],       'has_compare' => false],
            ['name' => 'Premium Supima Tee',        'name_pl' => 'Premium T-shirt Supima',             'category' => 'mens-clothing',    'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 7999,  'flags' => ['bestseller'],            'colors' => ['white', 'slate'],      'has_compare' => true],
            ['name' => 'Graphic Print Tee',         'name_pl' => 'T-shirt z Nadrukiem',                'category' => 'mens-clothing',    'brand' => 'Northstar',   'type' => 'clothing',    'base_price' => 5999,  'flags' => ['new', 'limited'],        'colors' => ['black', 'olive'],      'has_compare' => false],
            ['name' => 'Long Sleeve Waffle Tee',    'name_pl' => 'Longsleeve Waflowy',                 'category' => 'mens-clothing',    'brand' => 'Crafted Co',  'type' => 'clothing',    'base_price' => 6999,  'flags' => [],                        'colors' => ['sand', 'forest'],      'has_compare' => false],
            ['name' => 'Classic Polo Shirt',        'name_pl' => 'Klasyczna Koszulka Polo',            'category' => 'mens-clothing',    'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 8999,  'flags' => ['bestseller'],            'colors' => ['navy', 'white'],       'has_compare' => true,  'sizes' => ['m', 'l']],
            ['name' => 'Slim Fit Jeans',            'name_pl' => 'Dopasowane Dżinsy',                  'category' => 'mens-clothing',    'brand' => 'Northstar',   'type' => 'clothing',    'base_price' => 12999, 'flags' => [],                        'colors' => ['navy', 'black'],       'has_compare' => false, 'sizes' => ['m', 'l']],
            ['name' => 'Relaxed Straight Jeans',    'name_pl' => 'Luźne Proste Dżinsy',               'category' => 'mens-clothing',    'brand' => 'Crafted Co',  'type' => 'clothing',    'base_price' => 13999, 'flags' => ['bestseller'],            'colors' => ['slate', 'navy'],       'has_compare' => true,  'sizes' => ['m', 'l']],
            ['name' => 'Cargo Combat Trousers',     'name_pl' => 'Spodnie Cargo',                      'category' => 'mens-clothing',    'brand' => 'Northstar',   'type' => 'clothing',    'base_price' => 11999, 'flags' => ['new'],                   'colors' => ['olive', 'black'],      'has_compare' => false, 'sizes' => ['m', 'l']],
            ['name' => 'Tailored Chino Trousers',   'name_pl' => 'Eleganckie Spodnie Chino',           'category' => 'mens-clothing',    'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 10999, 'flags' => [],                        'colors' => ['sand', 'navy'],        'has_compare' => false, 'sizes' => ['m', 'l']],
            ['name' => 'Fleece Jogger Pants',       'name_pl' => 'Dresowe Spodnie Jogger',             'category' => 'mens-clothing',    'brand' => 'Kinetic',     'type' => 'clothing',    'base_price' => 8999,  'flags' => [],                        'colors' => ['black', 'slate'],      'has_compare' => false],
            ['name' => 'Classic Pullover Hoodie',   'name_pl' => 'Klasyczna Bluza z Kapturem',         'category' => 'mens-clothing',    'brand' => 'Northstar',   'type' => 'clothing',    'base_price' => 14999, 'flags' => ['bestseller'],            'colors' => ['black', 'forest'],     'has_compare' => true],
            ['name' => 'Zip-Up Tech Hoodie',        'name_pl' => 'Techniczna Bluza na Zamek',          'category' => 'mens-clothing',    'brand' => 'Kinetic',     'type' => 'clothing',    'base_price' => 16999, 'flags' => ['new'],                   'colors' => ['navy', 'olive'],       'has_compare' => false],
            ['name' => 'Satin Bomber Jacket',       'name_pl' => 'Satynowa Kurtka Bomber',             'category' => 'mens-clothing',    'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 24999, 'flags' => ['new', 'limited'],        'colors' => ['black', 'olive'],      'has_compare' => true,  'sizes' => ['m', 'l']],
            ['name' => 'Indigo Denim Jacket',       'name_pl' => 'Dżinsowa Kurtka Indigo',             'category' => 'mens-clothing',    'brand' => 'Crafted Co',  'type' => 'clothing',    'base_price' => 18999, 'flags' => [],                        'colors' => ['navy', 'slate'],       'has_compare' => false, 'sizes' => ['m', 'l']],

            // ── Women's Clothing (14) ─────────────────────────────────────────
            ['name' => 'Floral Midi Dress',         'name_pl' => 'Kwiecista Sukienka Midi',            'category' => 'womens-clothing',  'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 13999, 'flags' => ['new'],                   'colors' => ['blush', 'terracotta'], 'sizes' => ['s', 'm'],   'has_compare' => false],
            ['name' => 'Satin Evening Slip Dress',  'name_pl' => 'Satynowa Sukienka Wieczorowa',       'category' => 'womens-clothing',  'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 18999, 'flags' => ['limited'],               'colors' => ['black', 'cream'],      'sizes' => ['s', 'm'],   'has_compare' => true],
            ['name' => 'Wrap Jersey Dress',         'name_pl' => 'Sukienka Jersey Zawijana',           'category' => 'womens-clothing',  'brand' => 'Crafted Co',  'type' => 'clothing',    'base_price' => 11999, 'flags' => ['bestseller'],            'colors' => ['terracotta', 'navy'],  'sizes' => ['s', 'm'],   'has_compare' => false],
            ['name' => 'Linen Summer Dress',        'name_pl' => 'Letnia Lniana Sukienka',             'category' => 'womens-clothing',  'brand' => 'Crafted Co',  'type' => 'clothing',    'base_price' => 14999, 'flags' => ['new', 'eco'],            'colors' => ['cream', 'sand'],       'sizes' => ['s', 'm'],   'has_compare' => false],
            ['name' => 'Knit Mini Dress',           'name_pl' => 'Mini Sukienka Dzianinowa',           'category' => 'womens-clothing',  'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 12999, 'flags' => [],                        'colors' => ['blush', 'slate'],      'sizes' => ['xs', 's'],  'has_compare' => false],
            ['name' => 'High Rise Skinny Jeans',    'name_pl' => 'Rurki z Wysokim Stanem',             'category' => 'womens-clothing',  'brand' => 'Northstar',   'type' => 'clothing',    'base_price' => 11999, 'flags' => ['bestseller'],            'colors' => ['navy', 'black'],       'sizes' => ['s', 'm'],   'has_compare' => true],
            ['name' => 'Vintage Mom Jeans',         'name_pl' => 'Vintage Dżinsy Mom',                 'category' => 'womens-clothing',  'brand' => 'Crafted Co',  'type' => 'clothing',    'base_price' => 12999, 'flags' => ['new'],                   'colors' => ['slate', 'sand'],       'sizes' => ['s', 'm'],   'has_compare' => false],
            ['name' => 'Wide Leg Linen Trousers',   'name_pl' => 'Szerokie Lniane Spodnie',            'category' => 'womens-clothing',  'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 10999, 'flags' => ['eco'],                   'colors' => ['cream', 'terracotta'], 'sizes' => ['s', 'm'],   'has_compare' => false],
            ['name' => 'Tailored Linen Shorts',     'name_pl' => 'Eleganckie Lniane Szorty',           'category' => 'womens-clothing',  'brand' => 'Crafted Co',  'type' => 'clothing',    'base_price' => 7999,  'flags' => ['new'],                   'colors' => ['sand', 'olive'],       'sizes' => ['xs', 's'],  'has_compare' => false],
            ['name' => 'Yoga Flare Leggings',       'name_pl' => 'Legginsy Joga Flare',                'category' => 'womens-clothing',  'brand' => 'Kinetic',     'type' => 'clothing',    'base_price' => 9999,  'flags' => [],                        'colors' => ['black', 'blush'],      'sizes' => ['xs', 's'],  'has_compare' => false],
            ['name' => 'Oversized Comfort Hoodie',  'name_pl' => 'Oversizowa Bluza Comfort',           'category' => 'womens-clothing',  'brand' => 'Northstar',   'type' => 'clothing',    'base_price' => 13999, 'flags' => ['bestseller'],            'colors' => ['cream', 'blush'],      'sizes' => ['s', 'm'],   'has_compare' => true],
            ['name' => 'Ribbed Knit Cardigan',      'name_pl' => 'Prążkowany Sweter Kardigan',         'category' => 'womens-clothing',  'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 15999, 'flags' => ['eco'],                   'colors' => ['sand', 'terracotta'],  'sizes' => ['s', 'm'],   'has_compare' => false],
            ['name' => 'Relaxed Linen Blouse',      'name_pl' => 'Swobodna Lniana Bluzka',             'category' => 'womens-clothing',  'brand' => 'Crafted Co',  'type' => 'clothing',    'base_price' => 8999,  'flags' => ['eco', 'new'],            'colors' => ['white', 'cream'],      'sizes' => ['s', 'm'],   'has_compare' => false],
            ['name' => 'Cropped Blazer',            'name_pl' => 'Krótki Blezer',                      'category' => 'womens-clothing',  'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 22999, 'flags' => ['new', 'limited'],        'colors' => ['black', 'sand'],       'sizes' => ['s', 'm'],   'has_compare' => true],

            // ── Kids' Clothing (7) ────────────────────────────────────────────
            ['name' => 'Kids Classic Tee',          'name_pl' => 'Dziecięcy T-shirt Classic',          'category' => 'kids-clothing',    'brand' => 'Northstar',   'type' => 'clothing',    'base_price' => 2999,  'flags' => [],                        'colors' => ['white', 'navy'],       'sizes' => ['xs', 's'],  'has_compare' => false],
            ['name' => 'Kids Zip Hoodie',           'name_pl' => 'Dziecięca Bluza na Zamek',           'category' => 'kids-clothing',    'brand' => 'Northstar',   'type' => 'clothing',    'base_price' => 5999,  'flags' => ['new'],                   'colors' => ['navy', 'olive'],       'sizes' => ['xs', 's'],  'has_compare' => false],
            ['name' => 'Kids Slim Jeans',           'name_pl' => 'Dziecięce Dopasowane Dżinsy',        'category' => 'kids-clothing',    'brand' => 'Crafted Co',  'type' => 'clothing',    'base_price' => 5999,  'flags' => [],                        'colors' => ['navy', 'black'],       'sizes' => ['xs', 's'],  'has_compare' => false],
            ['name' => 'Kids Cotton Shorts',        'name_pl' => 'Dziecięce Bawełniane Szorty',        'category' => 'kids-clothing',    'brand' => 'Northstar',   'type' => 'clothing',    'base_price' => 2499,  'flags' => [],                        'colors' => ['sand', 'olive'],       'sizes' => ['xs', 's'],  'has_compare' => false],
            ['name' => 'Kids Floral Dress',         'name_pl' => 'Dziecięca Kwiecista Sukienka',       'category' => 'kids-clothing',    'brand' => 'Aurelia',     'type' => 'clothing',    'base_price' => 4999,  'flags' => ['new'],                   'colors' => ['blush', 'cream'],      'sizes' => ['xs', 's'],  'has_compare' => false],
            ['name' => 'Kids Pyjama Set',           'name_pl' => 'Dziecięca Piżama',                   'category' => 'kids-clothing',    'brand' => 'Crafted Co',  'type' => 'clothing',    'base_price' => 4499,  'flags' => ['eco'],                   'colors' => ['cream', 'blush'],      'sizes' => ['xs', 's'],  'has_compare' => false],
            ['name' => 'Kids Lightweight Raincoat', 'name_pl' => 'Dziecięcy Lekki Płaszcz Przeciwdeszczowy', 'category' => 'kids-clothing', 'brand' => 'Kinetic',   'type' => 'clothing',    'base_price' => 8999,  'flags' => ['new'],                   'colors' => ['navy', 'forest'],      'sizes' => ['xs', 's'],  'has_compare' => false],

            // ── Footwear (10) ─────────────────────────────────────────────────
            ['name' => 'White Leather Sneakers',    'name_pl' => 'Białe Skórzane Sneakersy',           'category' => 'footwear',         'brand' => 'Northstar',   'type' => 'footwear',    'base_price' => 13999, 'flags' => ['bestseller'],            'colors' => ['white', 'black'],      'has_compare' => true],
            ['name' => 'Canvas Low-Top',            'name_pl' => 'Płócienne Buty Low-Top',             'category' => 'footwear',         'brand' => 'Northstar',   'type' => 'footwear',    'base_price' => 7999,  'flags' => [],                        'colors' => ['white', 'navy'],       'has_compare' => false],
            ['name' => 'Performance Running Shoe',  'name_pl' => 'Buty do Biegania Performance',       'category' => 'footwear',         'brand' => 'Kinetic',     'type' => 'footwear',    'base_price' => 17999, 'flags' => ['new'],                   'colors' => ['black', 'slate'],      'has_compare' => false],
            ['name' => 'Oxford Brogue Shoes',       'name_pl' => 'Eleganckie Brogsy Oxford',           'category' => 'footwear',         'brand' => 'Crafted Co',  'type' => 'footwear',    'base_price' => 22999, 'flags' => ['limited'],               'colors' => ['black', 'sand'],       'has_compare' => true],
            ['name' => 'Suede Chelsea Boots',       'name_pl' => 'Zamszowe Chelsea Boots',             'category' => 'footwear',         'brand' => 'Aurelia',     'type' => 'footwear',    'base_price' => 26999, 'flags' => ['bestseller'],            'colors' => ['black', 'terracotta'], 'has_compare' => true],
            ['name' => 'High-Top Canvas Trainers',  'name_pl' => 'Wysokie Trampki Płócienne',          'category' => 'footwear',         'brand' => 'Northstar',   'type' => 'footwear',    'base_price' => 9999,  'flags' => ['new'],                   'colors' => ['black', 'olive'],      'has_compare' => false],
            ['name' => 'Leather Penny Loafers',     'name_pl' => 'Skórzane Mokasyny',                  'category' => 'footwear',         'brand' => 'Crafted Co',  'type' => 'footwear',    'base_price' => 19999, 'flags' => [],                        'colors' => ['black', 'sand'],       'has_compare' => false],
            ['name' => 'Minimalist Leather Sandals', 'name_pl' => 'Minimalistyczne Sandały Skórzane',   'category' => 'footwear',         'brand' => 'Aurelia',     'type' => 'footwear',    'base_price' => 10999, 'flags' => ['eco'],                   'colors' => ['sand', 'black'],       'has_compare' => false],
            ['name' => 'Waterproof Hiking Boots',   'name_pl' => 'Wodoodporne Buty Trekkingowe',       'category' => 'footwear',         'brand' => 'Kinetic',     'type' => 'footwear',    'base_price' => 29999, 'flags' => ['new'],                   'colors' => ['forest', 'black'],     'has_compare' => false],
            ['name' => 'Slip-On Espadrilles',       'name_pl' => 'Espadryle Wsuwane',                  'category' => 'footwear',         'brand' => 'Crafted Co',  'type' => 'footwear',    'base_price' => 8499,  'flags' => ['eco'],                   'colors' => ['sand', 'navy'],        'has_compare' => false],

            // ── Bags & Accessories (10) ───────────────────────────────────────
            ['name' => 'Organic Canvas Tote',       'name_pl' => 'Organiczna Torba Bawełniana',        'category' => 'bags-accessories', 'brand' => 'Northstar',   'type' => 'accessories', 'base_price' => 4999,  'flags' => ['eco', 'bestseller'],     'colors' => ['black', 'cream'],      'has_compare' => false],
            ['name' => 'Leather Crossbody Bag',     'name_pl' => 'Skórzana Torebka na Ramię',          'category' => 'bags-accessories', 'brand' => 'Aurelia',     'type' => 'accessories', 'base_price' => 18999, 'flags' => ['bestseller'],            'colors' => ['black', 'terracotta'], 'has_compare' => true],
            ['name' => 'Roll-Top Backpack',         'name_pl' => 'Plecak Roll-Top',                    'category' => 'bags-accessories', 'brand' => 'Northstar',   'type' => 'accessories', 'base_price' => 22999, 'flags' => ['new'],                   'colors' => ['black', 'olive'],      'has_compare' => false],
            ['name' => 'Slim Laptop Sleeve',        'name_pl' => 'Smukły Pokrowiec na Laptopa',        'category' => 'bags-accessories', 'brand' => 'Mono Works',  'type' => 'accessories', 'base_price' => 8999,  'flags' => [],                        'colors' => ['slate', 'black'],      'has_compare' => false],
            ['name' => 'Braided Leather Belt',      'name_pl' => 'Pleciony Skórzany Pasek',            'category' => 'bags-accessories', 'brand' => 'Crafted Co',  'type' => 'accessories', 'base_price' => 5999,  'flags' => ['eco'],                   'colors' => ['black', 'sand'],       'has_compare' => false],
            ['name' => 'Chunky Wool Beanie',        'name_pl' => 'Gruba Wełniana Czapka',              'category' => 'bags-accessories', 'brand' => 'Crafted Co',  'type' => 'accessories', 'base_price' => 3999,  'flags' => ['new'],                   'colors' => ['navy', 'terracotta'],  'has_compare' => false],
            ['name' => 'Structured Baseball Cap',   'name_pl' => 'Strukturalna Czapka z Daszkiem',     'category' => 'bags-accessories', 'brand' => 'Northstar',   'type' => 'accessories', 'base_price' => 3499,  'flags' => [],                        'colors' => ['black', 'navy'],       'has_compare' => false],
            ['name' => 'Cashmere Blend Scarf',      'name_pl' => 'Szalik z Domieszką Kaszmiru',        'category' => 'bags-accessories', 'brand' => 'Aurelia',     'type' => 'accessories', 'base_price' => 9999,  'flags' => ['eco', 'limited'],        'colors' => ['cream', 'blush'],      'has_compare' => true],
            ['name' => 'Slim Card Wallet',          'name_pl' => 'Smukły Portfel na Karty',            'category' => 'bags-accessories', 'brand' => 'Mono Works',  'type' => 'accessories', 'base_price' => 4999,  'flags' => ['bestseller'],            'colors' => ['black', 'sand'],       'has_compare' => false],
            ['name' => 'Polarised Sunglasses',      'name_pl' => 'Polaryzacyjne Okulary Słoneczne',    'category' => 'bags-accessories', 'brand' => 'Aurelia',     'type' => 'accessories', 'base_price' => 12999, 'flags' => ['new'],                   'colors' => ['black', 'terracotta'], 'has_compare' => true],

            // ── Living Room (7) ───────────────────────────────────────────────
            ['name' => 'Travertine Stone Vase',     'name_pl' => 'Wazon z Trawertynu',                 'category' => 'living-room',      'brand' => 'Mono Works',  'type' => 'home-decor',  'base_price' => 6999,  'flags' => ['new'],                   'weight' => 1.5, 'has_compare' => false],
            ['name' => 'Woven Macramé Wall Art',    'name_pl' => 'Tkana Dekoracja Ścienna Makrama',    'category' => 'living-room',      'brand' => 'Crafted Co',  'type' => 'home-decor',  'base_price' => 8999,  'flags' => ['eco'],                   'weight' => 0.8, 'has_compare' => false],
            ['name' => 'Belgian Linen Cushion Set', 'name_pl' => 'Zestaw Poduszek z Belgijskiego Lnu', 'category' => 'living-room',      'brand' => 'Crafted Co',  'type' => 'home-decor',  'base_price' => 7999,  'flags' => ['bestseller'],            'weight' => 1.0, 'has_compare' => true],
            ['name' => 'Chunky Knit Throw Blanket', 'name_pl' => 'Grubo Dziergany Koc',               'category' => 'living-room',      'brand' => 'Crafted Co',  'type' => 'home-decor',  'base_price' => 11999, 'flags' => ['eco', 'bestseller'],     'weight' => 1.2, 'has_compare' => true],
            ['name' => 'Solid Oak Side Table',      'name_pl' => 'Stolik z Litego Dębu',              'category' => 'living-room',      'brand' => 'Crafted Co',  'type' => 'home-decor',  'base_price' => 29999, 'flags' => ['bestseller'],            'weight' => 8.0, 'has_compare' => false],
            ['name' => 'Marble & Brass Tray',       'name_pl' => 'Taca Marmurowo-Mosiężna',           'category' => 'living-room',      'brand' => 'Mono Works',  'type' => 'home-decor',  'base_price' => 5999,  'flags' => ['new'],                   'weight' => 1.8, 'has_compare' => false],
            ['name' => 'Handwoven Rattan Basket',   'name_pl' => 'Ręcznie Tkany Kosz Rattanowy',      'category' => 'living-room',      'brand' => 'Crafted Co',  'type' => 'home-decor',  'base_price' => 4999,  'flags' => ['eco'],                   'weight' => 0.6, 'has_compare' => false],

            // ── Bedroom (5) ───────────────────────────────────────────────────
            ['name' => 'Washed Linen Duvet Cover',  'name_pl' => 'Prana Lniana Pościel',              'category' => 'bedroom',          'brand' => 'Crafted Co',  'type' => 'home-decor',  'base_price' => 16999, 'flags' => ['eco', 'bestseller'],     'weight' => 1.0, 'has_compare' => true],
            ['name' => 'Cloud-Soft Pillow Set',     'name_pl' => 'Zestaw Poduszek Cloud-Soft',        'category' => 'bedroom',          'brand' => 'Crafted Co',  'type' => 'home-decor',  'base_price' => 9999,  'flags' => ['bestseller'],            'weight' => 1.5, 'has_compare' => false],
            ['name' => 'Adjustable Bedside Lamp',   'name_pl' => 'Regulowana Lampka Nocna',           'category' => 'bedroom',          'brand' => 'Mono Works',  'type' => 'home-decor',  'base_price' => 8999,  'flags' => ['new'],                   'weight' => 1.2, 'has_compare' => false],
            ['name' => 'Hand-Poured Soy Candle',    'name_pl' => 'Ręcznie Wylewana Świeca Sojowa',    'category' => 'bedroom',          'brand' => 'Crafted Co',  'type' => 'home-decor',  'base_price' => 2999,  'flags' => ['eco'],                   'weight' => 0.3, 'has_compare' => false],
            ['name' => 'Silk Sleep Eye Mask',       'name_pl' => 'Jedwabna Maska do Snu',             'category' => 'bedroom',          'brand' => 'Aurelia',     'type' => 'accessories', 'base_price' => 2499,  'flags' => [],                        'colors' => ['black', 'blush'],      'has_compare' => false],

            // ── Kitchen & Dining (8) ──────────────────────────────────────────
            ['name' => 'Ceramic Mug Set (4-pack)',  'name_pl' => 'Zestaw Ceramicznych Kubków (4 szt.)', 'category' => 'kitchen-dining',   'brand' => 'Mono Works',  'type' => 'kitchenware', 'base_price' => 5999,  'flags' => ['sale'],                  'weight' => 1.2, 'has_compare' => true],
            ['name' => 'Pour-Over Coffee Kit',      'name_pl' => 'Zestaw do Kawy Pour-Over',          'category' => 'kitchen-dining',   'brand' => 'Mono Works',  'type' => 'kitchenware', 'base_price' => 8999,  'flags' => ['bestseller'],            'weight' => 0.8, 'has_compare' => false],
            ['name' => 'Seasoned Cast Iron Skillet', 'name_pl' => 'Doprawiona Żeliwna Patelnia',       'category' => 'kitchen-dining',   'brand' => 'Crafted Co',  'type' => 'kitchenware', 'base_price' => 14999, 'flags' => ['bestseller'],            'weight' => 3.5, 'has_compare' => false],
            ['name' => 'Bamboo Cutting Board',      'name_pl' => 'Bambusowa Deska do Krojenia',       'category' => 'kitchen-dining',   'brand' => 'Crafted Co',  'type' => 'kitchenware', 'base_price' => 3999,  'flags' => ['eco'],                   'weight' => 1.0, 'has_compare' => false],
            ['name' => 'Digital Kitchen Scale',     'name_pl' => 'Cyfrowa Waga Kuchenna',             'category' => 'kitchen-dining',   'brand' => 'Mono Works',  'type' => 'kitchenware', 'base_price' => 4999,  'flags' => ['new'],                   'weight' => 0.5, 'has_compare' => false],
            ['name' => 'Borosilicate French Press', 'name_pl' => 'Prasa Francuska z Borokrzemianu',   'category' => 'kitchen-dining',   'brand' => 'Mono Works',  'type' => 'kitchenware', 'base_price' => 6999,  'flags' => ['new'],                   'weight' => 0.7, 'has_compare' => false],
            ['name' => 'Hand-Thrown Salad Bowl Set', 'name_pl' => 'Zestaw Misek do Sałatek',           'category' => 'kitchen-dining',   'brand' => 'Crafted Co',  'type' => 'kitchenware', 'base_price' => 8999,  'flags' => ['eco', 'bestseller'],     'weight' => 1.5, 'has_compare' => false],
            ['name' => 'Glass Meal Prep Containers', 'name_pl' => 'Szklane Pojemniki do Meal Prep',    'category' => 'kitchen-dining',   'brand' => 'Mono Works',  'type' => 'kitchenware', 'base_price' => 4999,  'flags' => ['eco'],                   'weight' => 1.2, 'has_compare' => false],

            // ── Skincare (7) ──────────────────────────────────────────────────
            ['name' => 'Vitamin C Brightening Serum', 'name_pl' => 'Rozświetlające Serum z Witaminą C', 'category' => 'skincare',         'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 7999,  'flags' => ['bestseller'],            'has_compare' => true],
            ['name' => 'Daily Hydrating Moisturiser', 'name_pl' => 'Codzienny Nawilżający Krem',       'category' => 'skincare',         'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 6499,  'flags' => ['bestseller'],            'has_compare' => false],
            ['name' => 'Retinol Eye Cream',         'name_pl' => 'Krem pod Oczy z Retinolem',         'category' => 'skincare',         'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 8999,  'flags' => ['new'],                   'has_compare' => false],
            ['name' => 'Rose Water Toning Mist',    'name_pl' => 'Tonizująca Mgiełka z Wodą Różaną',  'category' => 'skincare',         'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 4999,  'flags' => ['eco'],                   'has_compare' => false],
            ['name' => 'Gentle Micellar Cleanser',  'name_pl' => 'Delikatny Płyn Micelarny',          'category' => 'skincare',         'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 5999,  'flags' => [],                        'has_compare' => false],
            ['name' => 'SPF 50+ Face Shield',       'name_pl' => 'Krem Ochronny z Filtrem SPF 50+',  'category' => 'skincare',         'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 7499,  'flags' => ['new', 'bestseller'],     'has_compare' => false],
            ['name' => 'Glow Facial Oil Blend',     'name_pl' => 'Rozświetlający Olejek do Twarzy',   'category' => 'skincare',         'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 9999,  'flags' => ['limited'],               'has_compare' => true],

            // ── Body Care (5) ─────────────────────────────────────────────────
            ['name' => 'Nourishing Body Lotion',    'name_pl' => 'Odżywczy Balsam do Ciała',          'category' => 'body-care',        'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 4999,  'flags' => ['bestseller'],            'has_compare' => false],
            ['name' => 'Brown Sugar Exfoliating Scrub', 'name_pl' => 'Złuszczający Peeling z Brązowym Cukrem', 'category' => 'body-care', 'brand' => 'Vitalis',      'type' => 'beauty',      'base_price' => 5999,  'flags' => ['eco'],                   'has_compare' => false],
            ['name' => 'Botanical Shower Gel Set',  'name_pl' => 'Botaniczny Zestaw Żeli pod Prysznic', 'category' => 'body-care',       'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 7999,  'flags' => ['new'],                   'has_compare' => false],
            ['name' => 'Natural Dry Body Brush',    'name_pl' => 'Naturalna Szczotka do Suchego Masażu', 'category' => 'body-care',      'brand' => 'Crafted Co',  'type' => 'home-decor',  'base_price' => 2999,  'flags' => ['eco'],                   'weight' => 0.2, 'has_compare' => false],
            ['name' => 'Himalayan Bath Salt Soak',  'name_pl' => 'Himalajska Sól do Kąpieli',         'category' => 'body-care',        'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 4499,  'flags' => ['eco'],                   'has_compare' => false],

            // ── Hair Care (4) ─────────────────────────────────────────────────
            ['name' => 'Intensive Repair Hair Mask', 'name_pl' => 'Intensywna Maska Naprawcza do Włosów', 'category' => 'hair-care',      'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 6999,  'flags' => ['bestseller'],            'has_compare' => false],
            ['name' => 'Hydrating Argan Shampoo',   'name_pl' => 'Nawilżający Szampon Arganowy',       'category' => 'hair-care',        'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 5499,  'flags' => ['eco'],                   'has_compare' => false],
            ['name' => 'Weightless Leave-In Conditioner', 'name_pl' => 'Lekka Odżywka bez Spłukiwania', 'category' => 'hair-care',        'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 5999,  'flags' => [],                        'has_compare' => false],
            ['name' => 'Biotin Hair Growth Serum',  'name_pl' => 'Serum na Porost Włosów z Biotyną',  'category' => 'hair-care',        'brand' => 'Vitalis',     'type' => 'beauty',      'base_price' => 9999,  'flags' => ['new'],                   'has_compare' => false],

            // ── Activewear (5) ────────────────────────────────────────────────
            ['name' => '2-in-1 Running Shorts',     'name_pl' => 'Spodenki 2-w-1 do Biegania',        'category' => 'activewear',       'brand' => 'Kinetic',     'type' => 'clothing',    'base_price' => 6999,  'flags' => ['bestseller'],            'colors' => ['black', 'navy'],       'sizes' => ['s', 'm'],   'has_compare' => false],
            ['name' => 'High-Waist Sport Leggings', 'name_pl' => 'Legginsy Sportowe z Wysokim Stanem', 'category' => 'activewear',       'brand' => 'Kinetic',     'type' => 'clothing',    'base_price' => 9999,  'flags' => ['bestseller'],            'colors' => ['black', 'olive'],      'sizes' => ['xs', 's'],  'has_compare' => false],
            ['name' => 'Breathable Athletic Tee',   'name_pl' => 'Przewiewny T-shirt Sportowy',        'category' => 'activewear',       'brand' => 'Kinetic',     'type' => 'clothing',    'base_price' => 5499,  'flags' => ['new'],                   'colors' => ['white', 'slate'],      'sizes' => ['s', 'm'],   'has_compare' => false],
            ['name' => 'Lightweight Workout Hoodie', 'name_pl' => 'Lekka Bluza Treningowa',             'category' => 'activewear',       'brand' => 'Kinetic',     'type' => 'clothing',    'base_price' => 12999, 'flags' => [],                        'colors' => ['black', 'forest'],     'sizes' => ['s', 'm'],   'has_compare' => false],
            ['name' => 'Seamless Sports Bra',       'name_pl' => 'Bezszwowy Stanik Sportowy',          'category' => 'activewear',       'brand' => 'Kinetic',     'type' => 'clothing',    'base_price' => 5999,  'flags' => ['bestseller'],            'colors' => ['black', 'blush'],      'sizes' => ['xs', 's'],  'has_compare' => false],

            // ── Sport Equipment (4) ───────────────────────────────────────────
            ['name' => 'Natural Rubber Yoga Mat',   'name_pl' => 'Mata do Jogi z Naturalnego Kauczuku', 'category' => 'sport-equipment',  'brand' => 'Kinetic',     'type' => 'sport',       'base_price' => 8999,  'flags' => ['eco', 'bestseller'],     'weight' => 2.0, 'has_compare' => false],
            ['name' => 'Resistance Bands Set (5)',   'name_pl' => 'Zestaw Taśm Oporowych (5 szt.)',    'category' => 'sport-equipment',  'brand' => 'Kinetic',     'type' => 'sport',       'base_price' => 3999,  'flags' => ['bestseller'],            'weight' => 0.5, 'has_compare' => false],
            ['name' => 'Speed Jump Rope Pro',        'name_pl' => 'Profesjonalna Skakanka Speed',       'category' => 'sport-equipment',  'brand' => 'Kinetic',     'type' => 'sport',       'base_price' => 2999,  'flags' => [],                        'weight' => 0.3, 'has_compare' => false],
            ['name' => 'Insulated Water Bottle 1L', 'name_pl' => 'Izolowany Bidon 1L',                'category' => 'sport-equipment',  'brand' => 'Mono Works',  'type' => 'accessories', 'base_price' => 4999,  'flags' => ['eco', 'bestseller'],     'colors' => ['black', 'slate'],      'has_compare' => false],
        ];
    }
}
