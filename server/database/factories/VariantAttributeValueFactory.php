<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\ProductVariant;
use App\Models\VariantAttributeValue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VariantAttributeValue>
 */
class VariantAttributeValueFactory extends Factory
{
    protected $model = VariantAttributeValue::class;

    public function definition(): array
    {
        $attribute = Attribute::factory()->create();

        return [
            'variant_id' => ProductVariant::factory(),
            'attribute_id' => $attribute->getKey(),
            'attribute_value_id' => AttributeValue::factory()->for($attribute)->create()->getKey(),
        ];
    }
}
