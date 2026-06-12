<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Attribute;
use App\Models\Category;
use App\Models\CategoryAttributeSchema;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CategoryAttributeSchema>
 */
class CategoryAttributeSchemaFactory extends Factory
{
    protected $model = CategoryAttributeSchema::class;

    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'attribute_id' => Attribute::factory(),
            'is_required' => fake()->boolean(),
            'position' => fake()->numberBetween(0, 255),
        ];
    }
}
