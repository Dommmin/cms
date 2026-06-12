<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AttributeTypeEnum;
use App\Enums\ReviewStatusEnum;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Metafield;
use App\Models\MetafieldDefinition;
use App\Models\Product;
use App\Models\ProductFlag;
use App\Models\ProductReview;
use App\Models\ProductType;
use App\Models\ProductTypeAttribute;
use App\Models\ProductVariant;
use App\Models\Promotion;
use App\Models\VariantAttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EcommerceRelationSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Running EcommerceRelationSeeder...');

        // 1. Seed Product Flags
        $flags = $this->seedFlags();

        // 2. Make sure attributes exist
        $attributes = $this->ensureAttributesExist();

        // 3. Ensure all Product Types have products
        $this->ensureProductTypesHaveProducts($attributes);

        // 4. Assign Product Flags to products
        $this->assignFlagsToProducts($flags);

        // 5. Connect Discounts & Promotions to products/categories
        $this->connectDiscountsAndPromotions();

        // 6. Seed Product Reviews
        $this->seedReviews();

        // 7. Seed Metafields
        $this->seedMetafields();

        $this->command->info('EcommerceRelationSeeder completed successfully!');
    }

    private function seedFlags(): array
    {
        $flagDefs = [
            ['name' => 'Nowość', 'slug' => 'new', 'color' => '#2563EB', 'position' => 1],
            ['name' => 'Bestseller', 'slug' => 'bestseller', 'color' => '#059669', 'position' => 2],
            ['name' => 'Wyprzedaż', 'slug' => 'sale', 'color' => '#DC2626', 'position' => 3],
            ['name' => 'Eko', 'slug' => 'eco', 'color' => '#16A34A', 'position' => 4],
            ['name' => 'Limitowana edycja', 'slug' => 'limited', 'color' => '#7C3AED', 'position' => 5],
        ];

        $flags = [];
        foreach ($flagDefs as $def) {
            $flags[] = ProductFlag::query()->updateOrCreate(
                ['slug' => $def['slug']],
                [
                    'name' => $def['name'],
                    'color' => $def['color'],
                    'position' => $def['position'],
                    'is_active' => true,
                ]
            );
        }

        return $flags;
    }

    private function ensureAttributesExist(): array
    {
        $attrs = [
            'color' => [
                'name' => 'Kolor',
                'type' => AttributeTypeEnum::COLOR,
                'is_filterable' => true,
                'is_variant_selection' => true,
                'position' => 1,
                'values' => [
                    ['value' => 'Czarny', 'color_hex' => '#111111'],
                    ['value' => 'Biały', 'color_hex' => '#F5F5F5'],
                    ['value' => 'Czerwony', 'color_hex' => '#DC2626'],
                    ['value' => 'Niebieski', 'color_hex' => '#2563EB'],
                    ['value' => 'Zielony', 'color_hex' => '#16A34A'],
                ],
            ],
            'size' => [
                'name' => 'Rozmiar',
                'type' => AttributeTypeEnum::SELECT,
                'is_filterable' => true,
                'is_variant_selection' => true,
                'position' => 2,
                'values' => [
                    ['value' => 'XS'],
                    ['value' => 'S'],
                    ['value' => 'M'],
                    ['value' => 'L'],
                    ['value' => 'XL'],
                ],
            ],
            'shoe-size' => [
                'name' => 'Rozmiar buta',
                'type' => AttributeTypeEnum::SELECT,
                'is_filterable' => true,
                'is_variant_selection' => true,
                'position' => 3,
                'values' => [
                    ['value' => '38'],
                    ['value' => '39'],
                    ['value' => '40'],
                    ['value' => '41'],
                    ['value' => '42'],
                    ['value' => '43'],
                    ['value' => '44'],
                ],
            ],
            'scent' => [
                'name' => 'Zapach',
                'type' => AttributeTypeEnum::SELECT,
                'is_filterable' => true,
                'is_variant_selection' => true,
                'position' => 4,
                'values' => [
                    ['value' => 'Lawenda'],
                    ['value' => 'Róża'],
                    ['value' => 'Wanilia'],
                    ['value' => 'Eukaliptus'],
                ],
            ],
        ];

        $models = [];
        foreach ($attrs as $slug => $data) {
            $attribute = Attribute::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $data['name'],
                    'type' => $data['type'],
                    'is_filterable' => $data['is_filterable'],
                    'is_variant_selection' => $data['is_variant_selection'],
                    'position' => $data['position'],
                ]
            );

            $models[$slug] = $attribute;

            foreach ($data['values'] as $valData) {
                AttributeValue::query()->updateOrCreate(
                    [
                        'attribute_id' => $attribute->id,
                        'slug' => Str::slug($valData['value']),
                    ],
                    [
                        'value' => $valData['value'],
                        'color_hex' => $valData['color_hex'] ?? null,
                        'position' => 1,
                    ]
                );
            }
        }

        return $models;
    }

    private function ensureProductTypesHaveProducts(array $attrs): void
    {
        $typesToCheck = [
            'apparel' => [
                'name' => 'Apparel',
                'attributes' => ['color', 'size'],
                'products' => [
                    [
                        'name' => 'Klasyczny t-shirt bawełniany',
                        'desc' => 'T-shirt wykonany w 100% z wysokiej jakości bawełny czesanej.',
                        'variants' => [
                            ['color' => 'Czarny', 'size' => 'M', 'price' => 79.99],
                            ['color' => 'Biały', 'size' => 'L', 'price' => 79.99],
                            ['color' => 'Niebieski', 'size' => 'S', 'price' => 79.99],
                        ],
                    ],
                    [
                        'name' => 'Bluza z kapturem Premium',
                        'desc' => 'Gruba, ciepła bluza z kapturem z miękkim wykończeniem od wewnątrz.',
                        'variants' => [
                            ['color' => 'Czarny', 'size' => 'L', 'price' => 199.99],
                            ['color' => 'Biały', 'size' => 'XL', 'price' => 199.99],
                        ],
                    ],
                ],
            ],
            'accessories' => [
                'name' => 'Accessories',
                'attributes' => ['color'],
                'products' => [
                    [
                        'name' => 'Skórzany portfel minimalistyczny',
                        'desc' => 'Ręcznie szyty portfel z naturalnej skóry licowej.',
                        'variants' => [
                            ['color' => 'Czarny', 'price' => 149.99],
                        ],
                    ],
                ],
            ],
        ];

        // Ensure category "Moda" or "Akcesoria" exists
        $clothingCategory = Category::query()->where('slug->en', 'clothing')->first();
        if (! $clothingCategory) {
            $clothingCategory = Category::query()->create([
                'name' => ['pl' => 'Odzież', 'en' => 'Clothing'],
                'slug' => ['pl' => 'odziez', 'en' => 'clothing'],
                'is_active' => true,
            ]);
        }

        foreach ($typesToCheck as $typeSlug => $typeInfo) {
            $type = ProductType::query()->where('slug', $typeSlug)->first();
            if (! $type) {
                $type = ProductType::query()->create([
                    'slug' => $typeSlug,
                    'name' => $typeInfo['name'],
                    'has_variants' => $typeInfo['attributes'] !== [],
                    'variant_selection_attributes' => $typeInfo['attributes'],
                    'is_shippable' => true,
                ]);
            }

            // Bind attributes to product type
            foreach ($typeInfo['attributes'] as $pos => $attrSlug) {
                $attr = $attrs[$attrSlug] ?? null;
                if ($attr) {
                    ProductTypeAttribute::query()->updateOrCreate([
                        'product_type_id' => $type->id,
                        'attribute_id' => $attr->id,
                    ], [
                        'is_required' => true,
                        'position' => $pos + 1,
                    ]);
                }
            }

            // Check if products exist for this type
            if (Product::query()->where('product_type_id', $type->id)->count() === 0) {
                foreach ($typeInfo['products'] as $prodData) {
                    $slug = Str::slug($prodData['name']).'-'.Str::random(5);
                    $product = Product::query()->create([
                        'product_type_id' => $type->id,
                        'category_id' => $clothingCategory->id,
                        'name' => ['pl' => $prodData['name'], 'en' => $prodData['name']],
                        'slug' => ['pl' => $slug, 'en' => $slug],
                        'description' => ['pl' => $prodData['desc'], 'en' => $prodData['desc']],
                        'short_description' => ['pl' => 'Krótki opis '.$prodData['name'], 'en' => 'Short description of '.$prodData['name']],
                        'is_active' => true,
                        'is_saleable' => true,
                    ]);

                    $product->categories()->syncWithoutDetaching([$clothingCategory->id]);

                    $pos = 1;
                    foreach ($prodData['variants'] as $varData) {
                        $sku = 'SKU-'.Str::upper(Str::random(8));
                        $variantName = implode(' / ', array_filter([$varData['color'] ?? null, $varData['size'] ?? null]));
                        $variant = ProductVariant::query()->create([
                            'product_id' => $product->id,
                            'sku' => $sku,
                            'name' => ['pl' => $variantName, 'en' => $variantName],
                            'price' => (int) ($varData['price'] * 100),
                            'cost_price' => (int) ($varData['price'] * 0.5 * 100),
                            'stock_quantity' => random_int(20, 80),
                            'stock_threshold' => 5,
                            'is_active' => true,
                            'is_default' => $pos === 1,
                            'position' => $pos++,
                        ]);

                        // Attach Variant Attributes
                        foreach ($typeInfo['attributes'] as $attrSlug) {
                            if (isset($varData[$attrSlug])) {
                                $attrModel = $attrs[$attrSlug];
                                $valModel = AttributeValue::query()->where('attribute_id', $attrModel->id)
                                    ->where('value', $varData[$attrSlug])
                                    ->first();

                                if ($valModel) {
                                    VariantAttributeValue::query()->create([
                                        'variant_id' => $variant->id,
                                        'attribute_id' => $attrModel->id,
                                        'attribute_value_id' => $valModel->id,
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private function assignFlagsToProducts(array $flags): void
    {
        $products = Product::query()->get();
        if ($products->isEmpty()) {
            return;
        }

        foreach ($products as $product) {
            // Assign 1-2 random flags to ~40% of products
            if (random_int(1, 100) <= 40) {
                $count = random_int(1, 2);
                $randomFlags = collect($flags)->random($count)->pluck('id')->all();
                $product->flags()->sync($randomFlags);
            }
        }
    }

    private function connectDiscountsAndPromotions(): void
    {
        $products = Product::query()->take(20)->get();
        $categories = Category::query()->get();
        $promotions = Promotion::query()->get();
        $discounts = Discount::query()->get();

        foreach ($promotions as $promotion) {
            if ($promotion->apply_to === 'specific_categories' && $categories->isNotEmpty()) {
                $promotion->categories()->syncWithoutDetaching($categories->random(min(2, $categories->count()))->pluck('id')->all());
            } else {
                $promotion->products()->syncWithoutDetaching(
                    $products->random(min(5, $products->count()))->mapWithKeys(fn ($product): array => [$product->id => ['discount_value' => random_int(10, 30), 'discount_type' => 'percentage']])->all()
                );
            }
        }

        foreach ($discounts as $discount) {
            if ($categories->isNotEmpty()) {
                $discount->categories()->syncWithoutDetaching($categories->random(min(2, $categories->count()))->pluck('id')->all());
            }

            $discount->products()->syncWithoutDetaching($products->random(min(5, $products->count()))->pluck('id')->all());
        }
    }

    private function seedReviews(): void
    {
        // Check if there are customers, create some if not
        $customers = Customer::query()->get();
        if ($customers->isEmpty()) {
            $customerNames = [
                ['first_name' => 'Jan', 'last_name' => 'Kowalski', 'email' => 'jan.kowalski@example.com'],
                ['first_name' => 'Anna', 'last_name' => 'Nowak', 'email' => 'anna.nowak@example.com'],
                ['first_name' => 'Piotr', 'last_name' => 'Wiśniewski', 'email' => 'piotr.wisniewski@example.com'],
                ['first_name' => 'Katarzyna', 'last_name' => 'Wójcik', 'email' => 'kasia.wojcik@example.com'],
                ['first_name' => 'Michał', 'last_name' => 'Kamiński', 'email' => 'michal.k@example.com'],
            ];
            foreach ($customerNames as $cData) {
                $customers->push(Customer::query()->create($cData));
            }
        }

        $reviewPool = [
            5 => [
                ['title' => 'Rewelacyjny sprzęt!', 'body' => 'Jestem niezwykle zadowolony z tego zakupu. Działa szybko i bezproblemowo.'],
                ['title' => 'Polecam wszystkim', 'body' => 'Jakość wykonania stoi na najwyższym poziomie. Otrzymałem przesyłkę bardzo szybko.'],
                ['title' => 'Strzał w dziesiątkę', 'body' => 'Produkt w 100% zgodny z opisem. Spełnia wszystkie moje wymagania.'],
            ],
            4 => [
                ['title' => 'Bardzo dobry produkt', 'body' => 'Solidne wykonanie i dobra wydajność. Jedyny minus to dość wysoka cena.'],
                ['title' => 'Zdecydowanie udany zakup', 'body' => 'Używam go codziennie i nie mam większych zastrzeżeń. Polecam.'],
            ],
            3 => [
                ['title' => 'Może być', 'body' => 'Produkt przeciętny. Działa poprawnie, ale jakość mogłaby być nieco lepsza.'],
            ],
            2 => [
                ['title' => 'Słaba jakość', 'body' => 'Spodziewałem się czegoś lepszego. Słabe plastiki i mało intuicyjna obsługa.'],
            ],
        ];

        $products = Product::query()->get();
        foreach ($products as $product) {
            // Seed 1-3 reviews per product by different customers
            $numReviews = random_int(1, min(3, $customers->count()));
            $selectedCustomers = $customers->shuffle()->take($numReviews);

            foreach ($selectedCustomers as $customer) {
                $ratingRoll = random_int(1, 100);
                if ($ratingRoll <= 60) {
                    $rating = 5;
                } elseif ($ratingRoll <= 85) {
                    $rating = 4;
                } elseif ($ratingRoll <= 95) {
                    $rating = 3;
                } else {
                    $rating = 2;
                }

                $pool = $reviewPool[$rating];
                $reviewTemplate = $pool[array_rand($pool)];

                ProductReview::query()->firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'customer_id' => $customer->id,
                    ],
                    [
                        'rating' => $rating,
                        'title' => $reviewTemplate['title'],
                        'body' => $reviewTemplate['body'],
                        'status' => ReviewStatusEnum::Approved,
                        'is_verified_purchase' => random_int(1, 10) <= 8,
                        'helpful_count' => random_int(0, 15),
                    ]
                );
            }
        }
    }

    private function seedMetafields(): void
    {
        // 1. Create definitions
        $defs = [
            [
                'namespace' => 'custom',
                'key' => 'warranty_months',
                'name' => 'Okres gwarancji (miesiące)',
                'type' => 'integer',
                'description' => 'Liczba miesięcy gwarancji producenta.',
                'pinned' => true,
                'position' => 1,
            ],
            [
                'namespace' => 'custom',
                'key' => 'brand_origin',
                'name' => 'Kraj pochodzenia marki',
                'type' => 'string',
                'description' => 'Kraj, z którego wywodzi się marka.',
                'pinned' => true,
                'position' => 2,
            ],
            [
                'namespace' => 'custom',
                'key' => 'is_refurbished',
                'name' => 'Produkt odnowiony',
                'type' => 'boolean',
                'description' => 'Czy produkt był fabrycznie odnawiany.',
                'pinned' => true,
                'position' => 3,
            ],
        ];

        foreach ($defs as $def) {
            MetafieldDefinition::query()->updateOrCreate(
                [
                    'owner_type' => Product::class,
                    'namespace' => $def['namespace'],
                    'key' => $def['key'],
                ],
                $def
            );
        }

        // 2. Add Metafield values to products
        $products = Product::query()->get();
        $countries = ['Polska', 'Niemcy', 'USA', 'Korea Południowa', 'Japonia', 'Chiny'];

        foreach ($products as $product) {
            // Warranty months
            Metafield::query()->updateOrCreate(
                [
                    'owner_type' => Product::class,
                    'owner_id' => $product->id,
                    'namespace' => 'custom',
                    'key' => 'warranty_months',
                ],
                [
                    'type' => 'integer',
                    'value' => (string) collect([12, 24, 36])->random(),
                    'description' => 'Okres gwarancji',
                ]
            );

            // Brand origin
            Metafield::query()->updateOrCreate(
                [
                    'owner_type' => Product::class,
                    'owner_id' => $product->id,
                    'namespace' => 'custom',
                    'key' => 'brand_origin',
                ],
                [
                    'type' => 'string',
                    'value' => collect($countries)->random(),
                    'description' => 'Kraj pochodzenia',
                ]
            );

            // Is refurbished
            Metafield::query()->updateOrCreate(
                [
                    'owner_type' => Product::class,
                    'owner_id' => $product->id,
                    'namespace' => 'custom',
                    'key' => 'is_refurbished',
                ],
                [
                    'type' => 'boolean',
                    'value' => random_int(1, 100) <= 5 ? 'true' : 'false',
                    'description' => 'Status odnowienia',
                ]
            );
        }
    }
}
