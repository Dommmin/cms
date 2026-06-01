<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Cart;
use App\Models\Customer;
use App\Models\SharedCart;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SharedCart>
 */
class SharedCartFactory extends Factory
{
    protected $model = SharedCart::class;

    public function definition(): array
    {
        return [
            'source_cart_id' => Cart::factory(),
            'customer_id' => Customer::factory(),
            'public_token' => Str::random(64),
            'currency_code' => 'PLN',
            'locale' => 'en',
            'discount_code' => null,
            'snapshot' => [
                'items' => [],
            ],
            'expires_at' => now()->addDays(30),
            'uses_count' => 0,
            'last_used_at' => null,
            'is_active' => true,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (): array => [
            'expires_at' => now()->subDay(),
        ]);
    }
}
