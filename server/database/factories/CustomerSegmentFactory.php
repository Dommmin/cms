<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CustomerSegment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomerSegment>
 */
class CustomerSegmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->optional()->sentence(),
            'type' => $this->faker->randomElement(['manual', 'dynamic']),
            'rules' => null,
            'customers_count' => 0,
            'is_active' => true,
        ];
    }

    public function dynamic(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'dynamic',
            'rules' => [
                ['field' => 'total_spent', 'operator' => '>', 'value' => '500'],
            ],
        ]);
    }

    public function manual(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'manual',
            'rules' => null,
        ]);
    }
}
