<?php

declare(strict_types=1);

use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use Spatie\Permission\Models\Role;

it('lists active blogs via api', function (): void {
    Blog::factory()->count(2)->create();
    Blog::factory()->inactive()->create();

    $this->getJson('/api/v1/blogs')
        ->assertSuccessful()
        ->assertJsonCount(2);
});

it('shows a blog with paginated published posts', function (): void {
    $blog = Blog::factory()->create();
    BlogPost::factory()->published()->count(3)->create(['blog_id' => $blog->id]);
    BlogPost::factory()->count(2)->create(['blog_id' => $blog->id]); // draft

    $response = $this->getJson('/api/v1/blogs/'.$blog->slug.'?per_page=2')
        ->assertSuccessful();

    expect($response->json('blog.slug'))->toBe($blog->slug);
    expect($response->json('posts.data'))->toHaveCount(2);
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

it('assigns the default blog when creating a blog post without blog_id', function (): void {
    expect(Blog::query()->count())->toBe(0);

    $post = BlogPost::factory()->create(['blog_id' => null]);

    expect($post->blog_id)->not->toBeNull()
        ->and(Blog::query()->count())->toBe(1)
        ->and($post->blog?->getTranslation('slug', 'en'))->toBe('blog');
});

it('keeps blog_id when updating a blog post through admin flow', function (): void {
    Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $blog = Blog::factory()->create();
    $post = BlogPost::factory()->create([
        'blog_id' => $blog->id,
        'title' => ['en' => 'Original title'],
        'slug' => ['en' => 'original-title'],
        'content' => ['en' => 'Original content'],
    ]);

    $this->actingAs($admin)
        ->put(route('admin.blog.posts.update', $post), [
            'title' => ['en' => 'Updated title'],
            'slug' => ['en' => 'updated-title'],
            'excerpt' => ['en' => 'Updated excerpt'],
            'content' => ['en' => 'Updated content'],
            'content_json' => ['en' => ''],
            'content_type' => 'richtext',
            'status' => 'draft',
            'blog_category_id' => null,
            'tags' => [],
            'available_locales' => ['en'],
            'is_featured' => false,
            'featured_image' => null,
            'seo_title' => null,
            'seo_description' => null,
            'canonical_url' => null,
            'meta_robots' => 'index, follow',
            'og_image' => null,
            'sitemap_exclude' => false,
        ])
        ->assertSessionHasNoErrors();

    expect($post->fresh()->blog_id)->toBe($blog->id);
});

it('creates a blog post in admin flow without requiring blog selection', function (): void {
    Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    expect(Blog::query()->count())->toBe(0);

    $this->actingAs($admin)
        ->post(route('admin.blog.posts.store'), [
            'title' => ['en' => 'Admin created post'],
            'slug' => ['en' => 'admin-created-post'],
            'excerpt' => ['en' => 'Admin excerpt'],
            'content' => ['en' => 'Admin content'],
            'content_json' => ['en' => ''],
            'content_type' => 'richtext',
            'status' => 'draft',
            'blog_category_id' => null,
            'tags' => [],
            'available_locales' => ['en'],
            'is_featured' => false,
            'featured_image' => null,
            'seo_title' => null,
            'seo_description' => null,
            'canonical_url' => null,
            'meta_robots' => null,
            'og_image' => null,
            'sitemap_exclude' => false,
        ])
        ->assertRedirect(route('admin.blog.posts.index'))
        ->assertSessionHasNoErrors();

    $post = BlogPost::query()->where('slug->en', 'admin-created-post')->first();

    expect($post)->not->toBeNull()
        ->and($post?->blog_id)->not->toBeNull()
        ->and(Blog::query()->count())->toBe(1);
});

it('backfills existing posts without a blog using the release 1 migration', function (): void {
    $post = BlogPost::withoutEvents(fn (): BlogPost => BlogPost::factory()->create(['blog_id' => null]));

    expect($post->fresh()->blog_id)->toBeNull();

    $migration = require base_path('database/migrations/2026_06_12_090000_backfill_default_blog_for_blog_posts.php');
    $migration->up();

    expect($post->fresh()->blog_id)->not->toBeNull()
        ->and(Blog::query()->count())->toBe(1);
});

it('returns the primary public blog feed from /api/v1/blog/posts', function (): void {
    $post = BlogPost::factory()->published()->create([
        'title' => ['en' => 'Primary Feed Post'],
        'slug' => ['en' => 'primary-feed-post'],
        'content' => ['en' => 'Feed content'],
        'excerpt' => ['en' => 'Feed excerpt'],
    ]);

    $response = $this->getJson('/api/v1/blog/posts')
        ->assertSuccessful();

    expect($response->json('data.0.id'))->toBe($post->id)
        ->and($response->json('data.0.public_url'))->toBe('/blog/primary-feed-post');
});

it('keeps /api/v1/blogs compatibility for posts auto-assigned to the default blog', function (): void {
    expect(Blog::query()->count())->toBe(0);

    $post = BlogPost::factory()->published()->create([
        'blog_id' => null,
        'title' => ['en' => 'Compatibility Post'],
        'slug' => ['en' => 'compatibility-post'],
        'content' => ['en' => 'Compatibility content'],
        'excerpt' => ['en' => 'Compatibility excerpt'],
    ]);

    $blog = $post->fresh()->blog;

    expect($blog)->not->toBeNull();

    $this->getJson('/api/v1/blogs')
        ->assertSuccessful()
        ->assertJsonFragment(['id' => $blog->id]);

    $this->getJson('/api/v1/blogs/'.$blog->slug)
        ->assertSuccessful()
        ->assertJsonPath('blog.id', $blog->id)
        ->assertJsonFragment(['slug' => 'compatibility-post']);

    $this->getJson('/api/v1/blogs/'.$blog->slug.'/posts')
        ->assertSuccessful()
        ->assertJsonFragment(['slug' => 'compatibility-post']);
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
