<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'product_type_id' => ProductType::factory(),
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => ['en' => Str::slug($name).'-'.Str::random(5)],
            'description' => fake()->paragraph(),
            'short_description' => fake()->sentence(),
            'is_active' => true,
            'is_saleable' => true,
        ];
    }
}
