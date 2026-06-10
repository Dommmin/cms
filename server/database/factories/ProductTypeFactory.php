<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ProductType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Date;

/**
 * @extends Factory<ProductType>
 */
class ProductTypeFactory extends Factory
{
    protected $model = ProductType::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'slug' => fake()->slug(),
            'has_variants' => fake()->boolean(),
            'variant_selection_attributes' => fake()->words(),
            'is_shippable' => fake()->boolean(),
            'created_at' => Date::now(),
            'updated_at' => Date::now(),
        ];
    }
}
