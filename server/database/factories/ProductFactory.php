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
        $name = $this->faker->unique()->words(3, true);

        return [
            'product_type_id' => ProductType::factory(),
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(5),
            'description' => $this->faker->paragraph(),
            'short_description' => $this->faker->sentence(),
            'is_active' => true,
            'is_saleable' => true,
        ];
    }
}
