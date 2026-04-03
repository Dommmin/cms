<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'sku' => mb_strtoupper(fake()->bothify('SKU-####??')),
            'name' => fake()->words(2, true),
            'price' => fake()->numberBetween(1000, 100000),
            'cost_price' => fake()->numberBetween(500, 50000),
            'compare_at_price' => null,
            'weight' => fake()->randomFloat(2, 0, 10),
            'stock_quantity' => fake()->numberBetween(0, 100),
            'stock_threshold' => 5,
            'is_active' => true,
            'is_default' => false,
            'position' => 0,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }

    public function default(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_default' => true,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes): array => [
            'stock_quantity' => 0,
        ]);
    }

    public function lowStock(): static
    {
        return $this->state(fn (array $attributes): array => [
            'stock_quantity' => 3,
        ]);
    }
}
