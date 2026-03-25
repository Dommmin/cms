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
        return [
            'name' => $this->faker->name(),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->text(),
            'image_path' => $this->faker->word(),
            'is_active' => $this->faker->boolean(),
            'position' => $this->faker->randomNumber(),
            'seo_title' => $this->faker->word(),
            'seo_description' => $this->faker->text(),
            'created_at' => Date::now(),
            'updated_at' => Date::now(),

            'product_type_id' => null,
            'parent_id' => null,
        ];
    }
}
