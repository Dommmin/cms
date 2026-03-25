<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SupportCannedResponse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupportCannedResponse>
 */
class SupportCannedResponseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'shortcut' => fake()->unique()->word(),
            'body' => fake()->paragraph(),
        ];
    }
}
