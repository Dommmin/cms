<?php

declare(strict_types=1);

use App\Enums\BlogPostStatusEnum;
use App\Models\BlogPost;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
    $this->actingAs($this->user);
});

it('displays blog posts index page', function () {
    BlogPost::factory()->count(3)->create();

    $response = $this->get('/admin/blog/posts');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/blog/posts/index')
            ->has('posts.data', 3)
            ->has('statuses')
            ->has('categories')
        );
});

it('displays blog post create page', function () {
    $response = $this->get('/admin/blog/posts/create');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/blog/posts/create')
            ->has('categories')
        );
});

it('stores a new blog post', function () {
    $data = [
        'title' => ['en' => 'Test Blog Post'],
        'content' => ['en' => '<p>Some content here</p>'],
        'content_type' => 'richtext',
        'status' => 'draft',
    ];

    $response = $this->post('/admin/blog/posts', $data);

    $response->assertRedirect('/admin/blog/posts')
        ->assertSessionHas('success', 'Blog post created successfully');

    $this->assertDatabaseHas('blog_posts', [
        'title->en' => 'Test Blog Post',
        'user_id' => $this->user->id,
    ]);
});

it('auto-generates slug on store when not provided', function () {
    $data = [
        'title' => ['en' => 'My Test Post Title'],
        'content' => ['en' => '<p>Content</p>'],
        'content_type' => 'richtext',
        'status' => 'draft',
    ];

    $this->post('/admin/blog/posts', $data);

    $this->assertDatabaseHas('blog_posts', [
        'title->en' => 'My Test Post Title',
        'slug' => 'my-test-post-title',
    ]);
});

it('sets published_at when status is published', function () {
    $data = [
        'title' => ['en' => 'Published Post'],
        'content' => ['en' => '<p>Content</p>'],
        'content_type' => 'richtext',
        'status' => 'published',
    ];

    $this->post('/admin/blog/posts', $data);

    $post = BlogPost::where('title->en', 'Published Post')->first();
    expect($post)->not->toBeNull();
    expect($post->published_at)->not->toBeNull();
});

it('displays blog post edit page', function () {
    $post = BlogPost::factory()->create();

    $response = $this->get("/admin/blog/posts/{$post->id}/edit");

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/blog/posts/edit')
            ->where('post.id', $post->id)
            ->has('categories')
        );
});

it('updates an existing blog post', function () {
    $post = BlogPost::factory()->create(['title' => ['en' => 'Old Title']]);

    $data = [
        'title' => ['en' => 'Updated Title'],
        'content' => ['en' => '<p>Updated content</p>'],
        'content_type' => 'richtext',
        'status' => 'draft',
    ];

    $response = $this->put("/admin/blog/posts/{$post->id}", $data);

    $response->assertRedirect()->assertSessionHas('success', 'Blog post updated successfully');

    $this->assertDatabaseHas('blog_posts', [
        'id' => $post->id,
        'title->en' => 'Updated Title',
    ]);
});

it('deletes a blog post', function () {
    $post = BlogPost::factory()->create();

    $response = $this->delete("/admin/blog/posts/{$post->id}");

    $response->assertRedirect()->assertSessionHas('success', 'Blog post deleted successfully');

    $this->assertDatabaseMissing('blog_posts', ['id' => $post->id]);
});

it('publishes a blog post', function () {
    $post = BlogPost::factory()->draft()->create();

    $response = $this->post("/admin/blog/posts/{$post->id}/publish");

    $response->assertRedirect()->assertSessionHas('success', 'Blog post published successfully');

    $this->assertDatabaseHas('blog_posts', [
        'id' => $post->id,
        'status' => BlogPostStatusEnum::Published->value,
    ]);

    expect($post->fresh()->published_at)->not->toBeNull();
});

it('unpublishes a blog post', function () {
    $post = BlogPost::factory()->published()->create();

    $response = $this->post("/admin/blog/posts/{$post->id}/unpublish");

    $response->assertRedirect()->assertSessionHas('success', 'Blog post unpublished successfully');

    $this->assertDatabaseHas('blog_posts', [
        'id' => $post->id,
        'status' => BlogPostStatusEnum::Draft->value,
    ]);
});

it('toggles featured status', function () {
    $post = BlogPost::factory()->create(['is_featured' => false]);

    $response = $this->post("/admin/blog/posts/{$post->id}/toggle-featured");

    $response->assertRedirect()->assertSessionHas('success', 'Blog post marked as featured');

    $this->assertDatabaseHas('blog_posts', [
        'id' => $post->id,
        'is_featured' => true,
    ]);
});
