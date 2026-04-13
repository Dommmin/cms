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
            'name' => $this->faker->words(3, true),
            'key' => $this->faker->unique()->slug(2),
            'subject' => $this->faker->sentence(5),
            'body' => '<p>'.$this->faker->paragraph().'</p>',
            'description' => $this->faker->optional()->sentence(),
            'is_active' => true,
            'variables' => ['{{customer_name}}', '{{shop_name}}'],
        ];
    }
}
