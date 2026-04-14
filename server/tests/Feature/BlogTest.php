<?php

declare(strict_types=1);

use App\Models\Blog;
use App\Models\BlogPost;

it('lists active blogs via api', function (): void {
    Blog::factory()->count(2)->create();
    Blog::factory()->inactive()->create();

    $this->getJson('/api/v1/blogs')
        ->assertSuccessful()
        ->assertJsonCount(2);
});

it('shows a blog with paginated published posts', function (): void {
    $blog = Blog::factory()->create(['posts_per_page' => 5]);
    BlogPost::factory()->published()->count(3)->create(['blog_id' => $blog->id]);
    BlogPost::factory()->count(2)->create(['blog_id' => $blog->id]); // draft

    $response = $this->getJson('/api/v1/blogs/'.$blog->slug)
        ->assertSuccessful();

    expect($response->json('blog.slug'))->toBe($blog->slug);
    expect($response->json('posts.data'))->toHaveCount(3);
});

it('returns 404 for inactive blog', function (): void {
    $blog = Blog::factory()->inactive()->create();

    $this->getJson('/api/v1/blogs/'.$blog->slug)
        ->assertNotFound();
});

it('returns standalone posts for a blog', function (): void {
    $blog = Blog::factory()->create();
    BlogPost::factory()->published()->count(2)->create(['blog_id' => $blog->id]);

    $this->getJson(sprintf('/api/v1/blogs/%s/posts', $blog->slug))
        ->assertSuccessful()
        ->assertJsonCount(2, 'data');
});

it('stores a blog_id on blog post', function (): void {
    $blog = Blog::factory()->create();
    $post = BlogPost::factory()->create(['blog_id' => $blog->id]);

    expect($post->blog_id)->toBe($blog->id);
    expect($post->blog->slug)->toBe($blog->slug);
});

it('nullifies blog_id on blog posts when blog is deleted', function (): void {
    $blog = Blog::factory()->create();
    $post = BlogPost::factory()->create(['blog_id' => $blog->id]);

    $blog->delete();

    expect($post->fresh()->blog_id)->toBeNull();
});
