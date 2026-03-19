<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ProductType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Apparel',      'has_variants' => true,  'is_shippable' => true, 'variant_selection_attributes' => ['color', 'size']],
            ['name' => 'Home & Living', 'has_variants' => false, 'is_shippable' => true, 'variant_selection_attributes' => []],
            ['name' => 'Accessories',  'has_variants' => true,  'is_shippable' => true, 'variant_selection_attributes' => ['color']],
            ['name' => 'Smartphone',   'has_variants' => true,  'is_shippable' => true, 'variant_selection_attributes' => ['color']],
            ['name' => 'Laptop',       'has_variants' => true,  'is_shippable' => true, 'variant_selection_attributes' => ['storage']],
        ];

        foreach ($types as $type) {
            ProductType::query()->updateOrCreate(
                ['slug' => Str::slug($type['name'])],
                [
                    'name' => $type['name'],
                    'has_variants' => $type['has_variants'],
                    'is_shippable' => $type['is_shippable'],
                    'variant_selection_attributes' => $type['variant_selection_attributes'],
                ],
            );
        }
    }
}
