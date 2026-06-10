<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Webhook;
use App\Models\WebhookDelivery;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WebhookDelivery>
 */
class WebhookDeliveryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['success', 'failed', 'pending']);

        return [
            'webhook_id' => Webhook::factory(),
            'event' => fake()->randomElement(['order.created', 'order.paid', 'product.updated']),
            'payload' => ['id' => fake()->uuid(), 'test' => false],
            'status' => $status,
            'attempt' => fake()->numberBetween(1, 3),
            'response_status' => $status === 'pending' ? null : ($status === 'success' ? 200 : 500),
            'response_body' => $status === 'pending' ? null : fake()->sentence(),
            'duration_ms' => $status === 'pending' ? null : fake()->numberBetween(50, 2000),
            'delivered_at' => $status === 'pending' ? null : now(),
        ];
    }
}
