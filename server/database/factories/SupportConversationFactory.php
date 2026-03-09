<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\SupportChannelEnum;
use App\Enums\SupportConversationStatusEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SupportConversation>
 */
class SupportConversationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_id' => null,
            'assigned_to' => null,
            'email' => fake()->safeEmail(),
            'name' => fake()->name(),
            'subject' => fake()->sentence(4),
            'status' => SupportConversationStatusEnum::OPEN,
            'channel' => SupportChannelEnum::WIDGET,
            'last_reply_at' => now(),
        ];
    }
}
