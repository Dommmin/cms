<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CustomerNotification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomerNotification>
 */
final class CustomerNotificationFactory extends Factory
{
    protected $model = CustomerNotification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'customer_id' => null,
            'type' => $this->faker->randomElement(['order_status', 'return_status', 'low_stock', 'flash_sale', 'general']),
            'title' => $this->faker->sentence(4),
            'body' => $this->faker->paragraph(),
            'data' => null,
            'read_at' => null,
            'action_url' => null,
        ];
    }

    public function read(): static
    {
        return $this->state(['read_at' => now()]);
    }

    public function unread(): static
    {
        return $this->state(['read_at' => null]);
    }
}
