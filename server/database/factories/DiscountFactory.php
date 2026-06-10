<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Discount;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Discount>
 */
class DiscountFactory extends Factory
{
    protected $model = Discount::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['percentage', 'fixed_amount', 'free_shipping']);

        return [
            'code' => mb_strtoupper(Str::random(8)),
            'name' => fake()->words(3, true),
            'type' => $type,
            'value' => match ($type) {
                'percentage' => fake()->numberBetween(5, 50),
                'fixed_amount' => fake()->numberBetween(10, 200),
                default => null,
            },
            'apply_to' => 'all',
            'min_order_value' => null,
            'max_uses' => null,
            'uses_count' => 0,
            'max_uses_per_customer' => null,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDays(30),
            'is_active' => true,
        ];
    }
}
