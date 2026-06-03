<?php

declare(strict_types=1);

use App\Models\Blog;
use App\Models\BlogCategory;
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

it('filters blog posts by category slug via API', function (): void {
    $category = BlogCategory::factory()->create(['slug' => 'style-guide']);
    $otherCategory = BlogCategory::factory()->create(['slug' => 'tech']);

    $post1 = BlogPost::factory()->published()->create([
        'blog_category_id' => $category->id,
        'title' => ['en' => 'Post 1'],
        'excerpt' => ['en' => 'Excerpt 1'],
        'content' => ['en' => 'Content 1'],
        'slug' => ['en' => 'post-1'],
    ]);

    $post2 = BlogPost::factory()->published()->create([
        'blog_category_id' => $otherCategory->id,
        'title' => ['en' => 'Post 2'],
        'excerpt' => ['en' => 'Excerpt 2'],
        'content' => ['en' => 'Content 2'],
        'slug' => ['en' => 'post-2'],
    ]);

    $response = $this->getJson('/api/v1/blog/posts?category=style-guide')
        ->assertSuccessful()
        ->assertJsonCount(1, 'data');

    expect($response->json('data.0.id'))->toBe($post1->id);
});
