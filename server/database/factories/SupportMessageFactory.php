<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SupportConversation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SupportMessage>
 */
class SupportMessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'conversation_id' => SupportConversation::factory(),
            'sender_type' => 'customer',
            'sender_name' => fake()->name(),
            'body' => fake()->paragraph(),
            'is_internal' => false,
            'read_at' => null,
        ];
    }
}
