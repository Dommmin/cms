<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Webhook;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Webhook>
 */
class WebhookFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'url' => fake()->url(),
            'secret' => bin2hex(random_bytes(32)),
            'events' => fake()->randomElements(
                ['order.created', 'order.paid', 'order.shipped', 'customer.created', 'page.published', 'product.updated'],
                fake()->numberBetween(1, 3),
            ),
            'is_active' => true,
            'description' => fake()->optional()->sentence(),
            'failure_count' => 0,
        ];
    }
}
