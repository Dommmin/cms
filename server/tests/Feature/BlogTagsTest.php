<?php

declare(strict_types=1);

use App\Models\BlogPost;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Str;

describe('Blog Tags', function (): void {
    it('syncs tags when creating a blog post via admin controller', function (): void {
        $user = User::factory()->create();

        $post = BlogPost::factory()->create(['user_id' => $user->id]);

        Tag::query()->firstOrCreate(['slug' => 'laravel'], ['name' => 'Laravel']);
        Tag::query()->firstOrCreate(['slug' => 'php'], ['name' => 'PHP']);

        $post->tags()->sync(
            collect(['Laravel', 'PHP'])->map(
                fn (string $name): int => Tag::query()->firstOrCreate(['slug' => Str::slug($name)], ['name' => $name])->id
            )->all()
        );

        expect($post->fresh()->tags)->toHaveCount(2);
        expect($post->tags->pluck('name')->toArray())->toContain('Laravel', 'PHP');
    });

    it('creates new tags via firstOrCreate and does not duplicate', function (): void {
        Tag::query()->firstOrCreate(['slug' => 'laravel'], ['name' => 'Laravel']);
        Tag::query()->firstOrCreate(['slug' => 'laravel'], ['name' => 'Laravel']);

        expect(Tag::query()->where('slug', 'laravel')->count())->toBe(1);
    });

    it('syncs updated tags removing old ones', function (): void {
        $post = BlogPost::factory()->create();

        $tagA = Tag::query()->firstOrCreate(['slug' => 'tag-a'], ['name' => 'Tag A']);
        $tagB = Tag::query()->firstOrCreate(['slug' => 'tag-b'], ['name' => 'Tag B']);
        $tagC = Tag::query()->firstOrCreate(['slug' => 'tag-c'], ['name' => 'Tag C']);

        $post->tags()->sync([$tagA->id, $tagB->id]);
        expect($post->fresh()->tags)->toHaveCount(2);

        // Update — remove Tag A, add Tag C
        $post->tags()->sync([$tagB->id, $tagC->id]);
        $updatedTags = $post->fresh()->tags->pluck('name')->toArray();

        expect($updatedTags)->toContain('Tag B', 'Tag C');
        expect($updatedTags)->not->toContain('Tag A');
    });

    it('returns tags as string array in the API', function (): void {
        $post = BlogPost::factory()->published()->create();
        $tag = Tag::query()->firstOrCreate(['slug' => 'api-tag'], ['name' => 'Api Tag']);
        $post->tags()->sync([$tag->id]);

        $response = $this->getJson('/api/v1/blog/posts/'.$post->slug);

        $response->assertOk();
        $response->assertJsonPath('tags.0', 'Api Tag');
    });

    it('deleting a blog post removes pivot rows but not the tag', function (): void {
        $post = BlogPost::factory()->create();
        $tag = Tag::query()->firstOrCreate(['slug' => 'persistent'], ['name' => 'Persistent']);
        $post->tags()->sync([$tag->id]);

        $postId = $post->id;
        $post->delete();

        $this->assertDatabaseMissing('taggables', ['taggable_type' => BlogPost::class, 'taggable_id' => $postId]);
        $this->assertDatabaseHas('tags', ['slug' => 'persistent']);
    });

    it('tags auto-generates slug on create', function (): void {
        $tag = Tag::query()->create(['name' => 'Hello World']);

        expect($tag->slug)->toBe('hello-world');
    });

    it('tags updates slug on name change', function (): void {
        $tag = Tag::query()->create(['name' => 'Old Name', 'slug' => 'old-name']);
        $tag->update(['name' => 'New Name']);

        expect($tag->fresh()->slug)->toBe('new-name');
    });
});
