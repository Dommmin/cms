<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\Category;
use App\Models\CategoryAttributeSchema;
use App\Models\ProductType;
use Illuminate\Database\Seeder;

class CategoryAttributeSchemaSeeder extends Seeder
{
    public function run(): void
    {
        $productTypes = $this->seedProductTypes();
        $categories = $this->seedCategories($productTypes);

        foreach ($this->schemaDefinitions() as $categorySlug => $schema) {
            $category = $categories[$categorySlug];
            $this->syncSchema($category, $schema);
        }
    }

    /**
     * @return array<string, ProductType>
     */
    private function seedProductTypes(): array
    {
        return [
            'cosmetics' => ProductType::query()->updateOrCreate(
                ['slug' => 'cosmetics'],
                ['name' => 'Cosmetics', 'has_variants' => true, 'is_shippable' => true, 'variant_selection_attributes' => ['volume']],
            ),
            'electronics' => ProductType::query()->updateOrCreate(
                ['slug' => 'electronics'],
                ['name' => 'Electronics', 'has_variants' => true, 'is_shippable' => true, 'variant_selection_attributes' => ['color', 'edition']],
            ),
            'apparel' => ProductType::query()->updateOrCreate(
                ['slug' => 'apparel'],
                ['name' => 'Apparel', 'has_variants' => true, 'is_shippable' => true, 'variant_selection_attributes' => ['color', 'size']],
            ),
            'fashion-accessories' => ProductType::query()->updateOrCreate(
                ['slug' => 'fashion-accessories'],
                ['name' => 'Fashion Accessories', 'has_variants' => false, 'is_shippable' => true, 'variant_selection_attributes' => []],
            ),
        ];
    }

    /**
     * @param  array<string, ProductType>  $productTypes
     * @return array<string, Category>
     */
    private function seedCategories(array $productTypes): array
    {
        $definitions = [
            ['slug' => 'cosmetics', 'name_en' => 'Cosmetics', 'name_pl' => 'Kosmetyki', 'parent' => null, 'product_type' => null, 'position' => 1],
            ['slug' => 'face-creams', 'name_en' => 'Face Creams', 'name_pl' => 'Kremy do twarzy', 'parent' => 'cosmetics', 'product_type' => 'cosmetics', 'position' => 1],
            ['slug' => 'serums', 'name_en' => 'Serums', 'name_pl' => 'Serum', 'parent' => 'cosmetics', 'product_type' => 'cosmetics', 'position' => 2],
            ['slug' => 'sun-protection', 'name_en' => 'Sun Protection', 'name_pl' => 'Ochrona przeciwsłoneczna', 'parent' => 'cosmetics', 'product_type' => 'cosmetics', 'position' => 3],
            ['slug' => 'electronics', 'name_en' => 'Electronics', 'name_pl' => 'Elektronika', 'parent' => null, 'product_type' => null, 'position' => 2],
            ['slug' => 'smartphones', 'name_en' => 'Smartphones', 'name_pl' => 'Smartfony', 'parent' => 'electronics', 'product_type' => 'electronics', 'position' => 1],
            ['slug' => 'electronics-accessories', 'name_en' => 'Accessories', 'name_pl' => 'Akcesoria', 'parent' => 'electronics', 'product_type' => 'electronics', 'position' => 2],
            ['slug' => 'headphones', 'name_en' => 'Headphones', 'name_pl' => 'Słuchawki', 'parent' => 'electronics', 'product_type' => 'electronics', 'position' => 3],
            ['slug' => 'apparel', 'name_en' => 'Apparel', 'name_pl' => 'Odzież', 'parent' => null, 'product_type' => null, 'position' => 3],
            ['slug' => 't-shirts', 'name_en' => 'T-Shirts', 'name_pl' => 'T-shirty', 'parent' => 'apparel', 'product_type' => 'apparel', 'position' => 1],
            ['slug' => 'hoodies', 'name_en' => 'Hoodies', 'name_pl' => 'Bluzy', 'parent' => 'apparel', 'product_type' => 'apparel', 'position' => 2],
            ['slug' => 'shoes', 'name_en' => 'Shoes', 'name_pl' => 'Buty', 'parent' => 'apparel', 'product_type' => 'apparel', 'position' => 3],
            ['slug' => 'textile-accessories', 'name_en' => 'Textile Accessories', 'name_pl' => 'Akcesoria tekstylne', 'parent' => 'apparel', 'product_type' => 'fashion-accessories', 'position' => 4],
        ];

        $categories = [];

        foreach ($definitions as $definition) {
            $parent = $definition['parent'] ? $categories[$definition['parent']] : null;
            $productType = $definition['product_type'] ? $productTypes[$definition['product_type']] : null;

            $category = Category::query()->firstOrNew(['slug->en' => $definition['slug']]);
            $category->fill([
                'name' => ['en' => $definition['name_en'], 'pl' => $definition['name_pl']],
                'slug' => ['en' => $definition['slug'], 'pl' => $definition['slug']],
                'description' => [
                    'en' => sprintf('Demo category for %s.', $definition['name_en']),
                    'pl' => sprintf('Kategoria demo dla: %s.', $definition['name_pl']),
                ],
                'parent_id' => $parent?->id,
                'product_type_id' => $productType?->id,
                'is_active' => true,
                'position' => $definition['position'],
                'seo_title' => $definition['name_en'].' Demo',
                'seo_description' => 'Demo category prepared for catalog/content verification.',
                'image_path' => '/demo/categories/'.($definition['parent'] ?? $definition['slug']).'.svg',
                'og_image' => '/demo/categories/'.($definition['parent'] ?? $definition['slug']).'.svg',
            ]);
            $category->save();

            $categories[$definition['slug']] = $category;
        }

        return $categories;
    }

    /**
     * @return array<string, list<array{attribute: string, required: bool, position: int}>>
     */
    private function schemaDefinitions(): array
    {
        return [
            'cosmetics' => [
                ['attribute' => 'country_of_origin', 'required' => false, 'position' => 1],
                ['attribute' => 'vegan', 'required' => false, 'position' => 2],
                ['attribute' => 'organic', 'required' => false, 'position' => 3],
            ],
            'face-creams' => [
                ['attribute' => 'skin_type', 'required' => true, 'position' => 10],
                ['attribute' => 'active_ingredients', 'required' => false, 'position' => 20],
                ['attribute' => 'spf', 'required' => false, 'position' => 30],
                ['attribute' => 'valid_until', 'required' => false, 'position' => 40],
            ],
            'serums' => [
                ['attribute' => 'skin_type', 'required' => true, 'position' => 10],
                ['attribute' => 'active_ingredients', 'required' => true, 'position' => 20],
                ['attribute' => 'capacity_ml', 'required' => true, 'position' => 30],
            ],
            'sun-protection' => [
                ['attribute' => 'skin_type', 'required' => false, 'position' => 10],
                ['attribute' => 'spf', 'required' => true, 'position' => 20],
            ],
            'electronics' => [
                ['attribute' => 'country_of_origin', 'required' => false, 'position' => 1],
                ['attribute' => 'compatibility', 'required' => false, 'position' => 2],
            ],
            'smartphones' => [
                ['attribute' => 'screen_size', 'required' => true, 'position' => 10],
                ['attribute' => 'memory_gb', 'required' => true, 'position' => 20],
                ['attribute' => 'storage_gb', 'required' => true, 'position' => 30],
                ['attribute' => 'connector_type', 'required' => true, 'position' => 40],
                ['attribute' => 'wireless', 'required' => false, 'position' => 50],
                ['attribute' => 'waterproof', 'required' => false, 'position' => 60],
                ['attribute' => 'release_date', 'required' => false, 'position' => 70],
            ],
            'electronics-accessories' => [
                ['attribute' => 'compatibility', 'required' => true, 'position' => 10],
                ['attribute' => 'power_w', 'required' => true, 'position' => 20],
                ['attribute' => 'connector_type', 'required' => true, 'position' => 30],
                ['attribute' => 'weight_g', 'required' => false, 'position' => 40],
                ['attribute' => 'supported_devices', 'required' => false, 'position' => 50],
            ],
            'headphones' => [
                ['attribute' => 'wireless', 'required' => true, 'position' => 10],
                ['attribute' => 'waterproof', 'required' => false, 'position' => 20],
                ['attribute' => 'connector_type', 'required' => true, 'position' => 30],
                ['attribute' => 'features', 'required' => false, 'position' => 40],
                ['attribute' => 'supported_devices', 'required' => false, 'position' => 50],
                ['attribute' => 'release_date', 'required' => false, 'position' => 60],
            ],
            'apparel' => [
                ['attribute' => 'material', 'required' => true, 'position' => 1],
                ['attribute' => 'country_of_origin', 'required' => false, 'position' => 2],
            ],
            't-shirts' => [
                ['attribute' => 'gender', 'required' => false, 'position' => 10],
            ],
            'hoodies' => [
                ['attribute' => 'gender', 'required' => false, 'position' => 10],
                ['attribute' => 'organic', 'required' => false, 'position' => 20],
            ],
            'shoes' => [
                ['attribute' => 'gender', 'required' => false, 'position' => 10],
                ['attribute' => 'waterproof', 'required' => false, 'position' => 20],
            ],
            'textile-accessories' => [
                ['attribute' => 'material', 'required' => true, 'position' => 10],
                ['attribute' => 'country_of_origin', 'required' => false, 'position' => 20],
                ['attribute' => 'organic', 'required' => false, 'position' => 30],
            ],
        ];
    }

    /**
     * @param  list<array{attribute: string, required: bool, position: int}>  $schema
     */
    private function syncSchema(Category $category, array $schema): void
    {
        $attributeIds = [];

        foreach ($schema as $row) {
            $attribute = Attribute::query()->where('slug', $row['attribute'])->firstOrFail();
            $attributeIds[] = $attribute->id;

            CategoryAttributeSchema::query()->updateOrCreate(
                [
                    'category_id' => $category->id,
                    'attribute_id' => $attribute->id,
                ],
                [
                    'is_required' => $row['required'],
                    'position' => $row['position'],
                ],
            );
        }

        CategoryAttributeSchema::query()
            ->where('category_id', $category->id)
            ->whereNotIn('attribute_id', $attributeIds)
            ->delete();
    }
}
