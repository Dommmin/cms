<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Date;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $slug = fake()->slug();

        return [
            'name' => fake()->name(),
            'slug' => ['en' => $slug],
            'description' => fake()->text(),
            'image_path' => fake()->word(),
            'is_active' => fake()->boolean(),
            'position' => fake()->numberBetween(0, 255),
            'seo_title' => fake()->word(),
            'seo_description' => fake()->text(),
            'created_at' => Date::now(),
            'updated_at' => Date::now(),

            'product_type_id' => null,
            'parent_id' => null,
        ];
    }
}
