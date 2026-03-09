<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SupportCannedResponse>
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
