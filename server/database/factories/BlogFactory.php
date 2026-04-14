<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Blog;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Blog>
 */
class BlogFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'name' => ['en' => ucfirst($name)],
            'slug' => Str::slug($name),
            'description' => null,
            'layout' => fake()->randomElement(['grid', 'list', 'magazine']),
            'posts_per_page' => 12,
            'commentable' => true,
            'default_author_id' => null,
            'seo_title' => null,
            'seo_description' => null,
            'is_active' => true,
            'available_locales' => null,
            'position' => 0,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => ['is_active' => false]);
    }
}
