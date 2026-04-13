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
            'name' => $this->faker->words(3, true),
            'url' => $this->faker->url(),
            'secret' => bin2hex(random_bytes(32)),
            'events' => $this->faker->randomElements(
                ['order.created', 'order.paid', 'order.shipped', 'customer.created', 'product.updated'],
                $this->faker->numberBetween(1, 3),
            ),
            'is_active' => true,
            'description' => $this->faker->optional()->sentence(),
            'failure_count' => 0,
        ];
    }
}
