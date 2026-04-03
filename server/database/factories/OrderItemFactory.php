<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_variant_id' => ProductVariant::factory(),
            'product_name' => fake()->words(3, true),
            'variant_sku' => mb_strtoupper(fake()->bothify('???-####')),
            'quantity' => fake()->numberBetween(1, 5),
            'unit_price' => fake()->numberBetween(100, 10000),
            'subtotal' => fake()->numberBetween(100, 50000),
        ];
    }
}
