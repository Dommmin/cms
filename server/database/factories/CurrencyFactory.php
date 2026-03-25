<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Currency>
 */
class CurrencyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => $this->faker->unique()->randomElement(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL']),
            'name' => $this->faker->randomElement(['US Dollar', 'Euro', 'British Pound', 'Japanese Yen', 'Canadian Dollar', 'Australian Dollar', 'Swiss Franc', 'Chinese Yuan', 'Indian Rupee', 'Brazilian Real']),
            'symbol' => $this->faker->randomElement(['$', '€', '£', '¥', 'C$', 'A$', 'Fr', '¥', '₹', 'R$']),
            'decimal_places' => $this->faker->numberBetween(0, 4),
            'is_active' => true,
            'is_base' => false,
        ];
    }
}
