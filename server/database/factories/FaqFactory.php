<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Faq;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Faq>
 */
class FaqFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'question' => $this->faker->sentence().'?',
            'answer' => $this->faker->paragraph(3),
            'category' => $this->faker->randomElement(['General', 'Technical', 'Billing', 'Support']),
            'position' => $this->faker->numberBetween(1, 100),
            'is_active' => true,
            'views_count' => $this->faker->numberBetween(0, 1000),
            'helpful_count' => $this->faker->numberBetween(0, 100),
        ];
    }
}
