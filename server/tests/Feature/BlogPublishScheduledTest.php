<?php

declare(strict_types=1);

use App\Enums\BlogPostStatusEnum;
use App\Models\BlogPost;
use App\Models\User;

describe('blog:publish-scheduled command', function () {
    it('publishes scheduled posts whose publish date has passed', function () {
        $user = User::factory()->create();

        $post = BlogPost::factory()->create([
            'user_id' => $user->id,
            'status' => BlogPostStatusEnum::Scheduled,
            'published_at' => now()->subHour(),
        ]);

        $this->artisan('blog:publish-scheduled')->assertSuccessful();

        expect($post->fresh()->status->value)->toBe(BlogPostStatusEnum::Published->value);
    });

    it('does not publish posts scheduled for the future', function () {
        $user = User::factory()->create();

        $post = BlogPost::factory()->create([
            'user_id' => $user->id,
            'status' => BlogPostStatusEnum::Scheduled,
            'published_at' => now()->addDay(),
        ]);

        $this->artisan('blog:publish-scheduled')->assertSuccessful();

        expect($post->fresh()->status->value)->toBe(BlogPostStatusEnum::Scheduled->value);
    });

    it('does not affect already published posts', function () {
        $user = User::factory()->create();

        $post = BlogPost::factory()->create([
            'user_id' => $user->id,
            'status' => BlogPostStatusEnum::Published,
            'published_at' => now()->subWeek(),
        ]);

        $this->artisan('blog:publish-scheduled')->assertSuccessful();

        expect($post->fresh()->status->value)->toBe(BlogPostStatusEnum::Published->value);
    });

    it('does not affect draft posts', function () {
        $user = User::factory()->create();

        $post = BlogPost::factory()->create([
            'user_id' => $user->id,
            'status' => BlogPostStatusEnum::Draft,
            'published_at' => now()->subDay(),
        ]);

        $this->artisan('blog:publish-scheduled')->assertSuccessful();

        expect($post->fresh()->status->value)->toBe(BlogPostStatusEnum::Draft->value);
    });

    it('processes multiple posts in one run', function () {
        $user = User::factory()->create();

        $posts = BlogPost::factory()->count(3)->create([
            'user_id' => $user->id,
            'status' => BlogPostStatusEnum::Scheduled,
            'published_at' => now()->subMinutes(10),
        ]);

        $this->artisan('blog:publish-scheduled')->assertSuccessful();

        foreach ($posts as $post) {
            expect($post->fresh()->status->value)->toBe(BlogPostStatusEnum::Published->value);
        }
    });

    it('outputs how many posts were published', function () {
        $user = User::factory()->create();

        BlogPost::factory()->count(2)->create([
            'user_id' => $user->id,
            'status' => BlogPostStatusEnum::Scheduled,
            'published_at' => now()->subMinutes(5),
        ]);

        $this->artisan('blog:publish-scheduled')
            ->expectsOutputToContain('2')
            ->assertSuccessful();
    });
});
