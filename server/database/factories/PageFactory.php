<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    protected $model = Page::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'slug' => fake()->unique()->slug(),
            'layout' => 'default',
            'page_type' => 'blocks',
            'is_published' => false,
            'position' => 0,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_published' => true,
            'published_at' => now(),
        ]);
    }
}
