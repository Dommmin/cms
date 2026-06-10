<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\EmailTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmailTemplate>
 */
class EmailTemplateFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'key' => fake()->unique()->slug(2),
            'subject' => fake()->sentence(5),
            'body' => '<p>'.fake()->paragraph().'</p>',
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
            'variables' => ['{{customer_name}}', '{{shop_name}}'],
        ];
    }
}
