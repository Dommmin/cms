<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Date;

/**
 * @extends Factory<FlashSale>
 */
class FlashSaleFactory extends Factory
{
    protected $model = FlashSale::class;

    public function definition(): array
    {
        $startsAt = Date::now()->subHour();
        $endsAt = Date::now()->addHours(24);

        return [
            'product_id' => Product::factory(),
            'variant_id' => null,
            'name' => $this->faker->words(2, true).' Sale',
            'sale_price' => $this->faker->numberBetween(500, 10000),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'stock_limit' => null,
            'stock_sold' => 0,
            'is_active' => true,
        ];
    }

    public function active(): static
    {
        return $this->state([
            'is_active' => true,
            'starts_at' => Date::now()->subHour(),
            'ends_at' => Date::now()->addHours(24),
        ]);
    }

    public function scheduled(): static
    {
        return $this->state([
            'is_active' => true,
            'starts_at' => Date::now()->addHour(),
            'ends_at' => Date::now()->addHours(25),
        ]);
    }

    public function ended(): static
    {
        return $this->state([
            'is_active' => false,
            'starts_at' => Date::now()->subDays(2),
            'ends_at' => Date::now()->subDay(),
        ]);
    }

    public function withStockLimit(int $limit, int $sold = 0): static
    {
        return $this->state([
            'stock_limit' => $limit,
            'stock_sold' => $sold,
        ]);
    }
}
