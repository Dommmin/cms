<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\BlogPostStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogPostRequest;
use App\Http\Requests\Admin\UpdateBlogPostRequest;
use App\Models\BlogPost;
use App\Queries\Admin\BlogCategoryIndexQuery;
use App\Queries\Admin\BlogPostIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Response;

class BlogPostController extends Controller
{
    public function index(Request $request): Response
    {
        $postQuery = new BlogPostIndexQuery;
        $categoryQuery = new BlogCategoryIndexQuery;

        $posts = $postQuery->paginate($request->only(['search', 'category_id', 'status', 'content_type', 'per_page']));
        $statuses = $postQuery->statuses();
        $categories = $categoryQuery->categoriesForSelect();

        return inertia('admin/blog/posts/index', [
            'posts' => $posts,
            'filters' => $request->only(['search', 'category_id', 'status', 'content_type']),
            'statuses' => $statuses,
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        $categoryQuery = new BlogCategoryIndexQuery;

        return inertia('admin/blog/posts/create', [
            'categories' => $categoryQuery->categoriesForSelect(),
        ]);
    }

    public function store(StoreBlogPostRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['user_id'] = auth()->id();
        $titleForSlug = is_array($data['title'])
            ? ($data['title'][config('app.locale')] ?? array_values($data['title'])[0] ?? '')
            : (string) $data['title'];
        $data['slug'] ??= Str::slug($titleForSlug);
        $data['is_featured'] ??= false;
        $contentForEstimate = is_array($data['content'])
            ? ($data['content'][config('app.locale')] ?? array_values($data['content'])[0] ?? '')
            : (string) $data['content'];
        $data['reading_time'] = (new BlogPost)->estimateReadingTime($contentForEstimate);

        $status = $data['status'] ?? 'draft';

        if ($status === 'published') {
            $data['published_at'] ??= now();
        } elseif ($status !== 'scheduled') {
            $data['published_at'] = null;
        }

        BlogPost::query()->create($data);

        return to_route('admin.blog.posts.index')->with('success', 'Blog post created successfully');
    }

    public function edit(BlogPost $post): Response
    {
        $categoryQuery = new BlogCategoryIndexQuery;
        $post->load('category', 'author');

        return inertia('admin/blog/posts/edit', [
            'post' => array_merge($post->toArray(), [
                'title' => $post->getTranslations('title'),
                'excerpt' => $post->getTranslations('excerpt'),
                'content' => $post->getTranslations('content'),
                'available_locales' => $post->available_locales,
            ]),
            'categories' => $categoryQuery->categoriesForSelect(),
        ]);
    }

    public function update(UpdateBlogPostRequest $request, BlogPost $post): RedirectResponse
    {
        $data = $request->validated();

        $titleForSlug = is_array($data['title'])
            ? ($data['title'][config('app.locale')] ?? array_values($data['title'])[0] ?? '')
            : (string) $data['title'];
        $data['slug'] ??= Str::slug($titleForSlug);
        $data['is_featured'] ??= false;
        $contentForEstimate = is_array($data['content'])
            ? ($data['content'][config('app.locale')] ?? array_values($data['content'])[0] ?? '')
            : (string) $data['content'];
        $data['reading_time'] = (new BlogPost)->estimateReadingTime($contentForEstimate);

        $status = $data['status'] ?? 'draft';

        if ($status === 'published' && $post->published_at === null) {
            $data['published_at'] ??= now();
        } elseif ($status !== 'scheduled' && $status !== 'published') {
            $data['published_at'] = null;
        }

        $post->update($data);

        return back()->with('success', 'Blog post updated successfully');
    }

    public function destroy(BlogPost $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', 'Blog post deleted successfully');
    }

    public function publish(BlogPost $post): RedirectResponse
    {
        $post->update([
            'status' => BlogPostStatusEnum::Published,
            'published_at' => $post->published_at ?? now(),
        ]);

        return back()->with('success', 'Blog post published successfully');
    }

    public function unpublish(BlogPost $post): RedirectResponse
    {
        $post->update(['status' => BlogPostStatusEnum::Draft]);

        return back()->with('success', 'Blog post unpublished successfully');
    }

    public function toggleFeatured(BlogPost $post): RedirectResponse
    {
        $post->update(['is_featured' => ! $post->is_featured]);

        $message = $post->is_featured ? 'Blog post marked as featured' : 'Blog post removed from featured';

        return back()->with('success', $message);
    }
}
