<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\AttributeTypeEnum;
use App\Models\Attribute;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Attribute>
 */
class AttributeFactory extends Factory
{
    protected $model = Attribute::class;

    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'type' => AttributeTypeEnum::TEXT,
            'unit' => null,
            'is_filterable' => true,
            'is_variant_selection' => true,
            'position' => 0,
        ];
    }
}
