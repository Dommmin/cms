<?php

declare(strict_types=1);

use App\Models\BlogPost;
use App\Models\BlogPostVote;
use App\Models\User;

describe('Blog Votes', function (): void {
    it('authenticated user can upvote a post', function (): void {
        $post = BlogPost::factory()->published()->create();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/blog/posts/%s/vote', $post->slug), ['vote' => 'up'])
            ->assertOk()
            ->assertJsonPath('votes_up', 1)
            ->assertJsonPath('votes_down', 0)
            ->assertJsonPath('user_vote', 'up');
    });

    it('voting same direction again removes the vote', function (): void {
        $post = BlogPost::factory()->published()->create();
        $user = User::factory()->create();

        BlogPostVote::query()->create([
            'blog_post_id' => $post->id,
            'user_id' => $user->id,
            'vote' => 'up',
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/blog/posts/%s/vote', $post->slug), ['vote' => 'up'])
            ->assertOk()
            ->assertJsonPath('votes_up', 0)
            ->assertJsonPath('user_vote', null);
    });

    it('changing vote updates the existing record', function (): void {
        $post = BlogPost::factory()->published()->create();
        $user = User::factory()->create();

        BlogPostVote::query()->create([
            'blog_post_id' => $post->id,
            'user_id' => $user->id,
            'vote' => 'up',
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/blog/posts/%s/vote', $post->slug), ['vote' => 'down'])
            ->assertOk()
            ->assertJsonPath('votes_up', 0)
            ->assertJsonPath('votes_down', 1)
            ->assertJsonPath('user_vote', 'down');
    });

    it('guest cannot vote', function (): void {
        $post = BlogPost::factory()->published()->create();

        $this->postJson(sprintf('/api/v1/blog/posts/%s/vote', $post->slug), ['vote' => 'up'])
            ->assertUnauthorized();
    });

    it('rejects invalid vote value', function (): void {
        $post = BlogPost::factory()->published()->create();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/blog/posts/%s/vote', $post->slug), ['vote' => 'neutral'])
            ->assertUnprocessable();
    });
});
