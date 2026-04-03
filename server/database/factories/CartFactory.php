<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Cart;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cart>
 */
class CartFactory extends Factory
{
    protected $model = Cart::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'session_token' => fake()->uuid(),
            'discount_code' => null,
        ];
    }

    public function guest(): static
    {
        return $this->state(fn (array $attributes): array => [
            'customer_id' => null,
        ]);
    }

    public function withDiscount(string $code): static
    {
        return $this->state(fn (array $attributes): array => [
            'discount_code' => $code,
        ]);
    }
}
