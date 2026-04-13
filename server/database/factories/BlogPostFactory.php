<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\BlogPostStatusEnum;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BlogPost>
 */
class BlogPostFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->sentence(6);
        $content = fake()->paragraphs(5, true);

        return [
            'user_id' => User::factory(),
            'blog_category_id' => null,
            'title' => mb_rtrim($title, '.'),
            'slug' => Str::slug($title),
            'excerpt' => fake()->optional()->paragraph(),
            'content' => $content,
            'content_type' => 'richtext',
            'status' => BlogPostStatusEnum::Draft,
            'featured_image' => null,
            'available_locales' => null,
            'is_featured' => false,
            'published_at' => null,
            'reading_time' => fake()->numberBetween(1, 15),
            'seo_title' => null,
            'seo_description' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => BlogPostStatusEnum::Published,
            'published_at' => now(),
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes): array => ['is_featured' => true]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => BlogPostStatusEnum::Draft,
            'published_at' => null,
        ]);
    }
}
