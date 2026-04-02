<?php

declare(strict_types=1);

use App\Models\BlogComment;
use App\Models\BlogPost;
use App\Models\User;

describe('Blog Comments – listing', function (): void {
    it('returns top-level approved comments with replies', function (): void {
        $post = BlogPost::factory()->published()->create();
        $user = User::factory()->create();

        $comment = BlogComment::query()->create([
            'blog_post_id' => $post->id,
            'user_id' => $user->id,
            'body' => 'Top level comment',
            'is_approved' => true,
        ]);

        $reply = BlogComment::query()->create([
            'blog_post_id' => $post->id,
            'user_id' => $user->id,
            'parent_id' => $comment->id,
            'body' => 'Reply',
            'is_approved' => true,
        ]);

        $this->getJson("/api/v1/blog/posts/{$post->slug}/comments")
            ->assertOk()
            ->assertJsonPath('data.0.id', $comment->id)
            ->assertJsonPath('data.0.replies.0.id', $reply->id);
    });

    it('does not return unapproved comments', function (): void {
        $post = BlogPost::factory()->published()->create();
        $user = User::factory()->create();

        BlogComment::query()->create([
            'blog_post_id' => $post->id,
            'user_id' => $user->id,
            'body' => 'Hidden comment',
            'is_approved' => false,
        ]);

        $this->getJson("/api/v1/blog/posts/{$post->slug}/comments")
            ->assertOk()
            ->assertJsonPath('data', []);
    });
});

describe('Blog Comments – posting', function (): void {
    it('authenticated user can post a comment', function (): void {
        $post = BlogPost::factory()->published()->create();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/blog/posts/{$post->slug}/comments", ['body' => 'Great post!'])
            ->assertCreated()
            ->assertJsonPath('body', 'Great post!');

        expect(BlogComment::query()->where('blog_post_id', $post->id)->count())->toBe(1);
    });

    it('guest cannot post a comment', function (): void {
        $post = BlogPost::factory()->published()->create();

        $this->postJson("/api/v1/blog/posts/{$post->slug}/comments", ['body' => 'Hello'])
            ->assertUnauthorized();
    });

    it('can reply to a top-level comment', function (): void {
        $post = BlogPost::factory()->published()->create();
        $user = User::factory()->create();
        $parent = BlogComment::query()->create([
            'blog_post_id' => $post->id,
            'user_id' => $user->id,
            'body' => 'Parent',
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/blog/posts/{$post->slug}/comments", [
                'body' => 'Reply!',
                'parent_id' => $parent->id,
            ])
            ->assertCreated()
            ->assertJsonPath('parent_id', $parent->id);
    });

    it('cannot reply to a reply (only one level deep)', function (): void {
        $post = BlogPost::factory()->published()->create();
        $user = User::factory()->create();
        $parent = BlogComment::query()->create([
            'blog_post_id' => $post->id,
            'user_id' => $user->id,
            'body' => 'Parent',
        ]);
        $reply = BlogComment::query()->create([
            'blog_post_id' => $post->id,
            'user_id' => $user->id,
            'parent_id' => $parent->id,
            'body' => 'Reply',
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/blog/posts/{$post->slug}/comments", [
                'body' => 'Nested reply',
                'parent_id' => $reply->id,
            ])
            ->assertUnprocessable();
    });

    it('validates body length', function (): void {
        $post = BlogPost::factory()->published()->create();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/blog/posts/{$post->slug}/comments", ['body' => 'Hi'])
            ->assertUnprocessable();
    });
});
