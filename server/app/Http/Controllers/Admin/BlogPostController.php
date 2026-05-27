<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\BlogPostStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogPostRequest;
use App\Http\Requests\Admin\UpdateBlogPostRequest;
use App\Models\BlogPost;
use App\Models\Tag;
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
            'available_tags' => Tag::query()->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function store(StoreBlogPostRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        $data['user_id'] = auth()->id();
        $titleForSlug = is_array($data['title'])
            ? ($data['title'][config('app.locale')] ?? array_values($data['title'])[0] ?? '')
            : (string) ($data['title'] ?? '');
        if (empty($data['slug']) || (is_array($data['slug']) && array_filter($data['slug']) === [])) {
            $data['slug'] = [config('app.locale') => Str::slug($titleForSlug) ?: 'untitled'];
        }

        $data['is_featured'] ??= false;
        $contentForEstimate = is_array($data['content'])
            ? ($data['content'][config('app.locale')] ?? array_values($data['content'])[0] ?? '')
            : (string) ($data['content'] ?? '');
        $data['reading_time'] = (new BlogPost)->estimateReadingTime($contentForEstimate);

        $status = $data['status'] ?? 'draft';

        if ($status === 'published') {
            $data['published_at'] ??= now();
        } elseif ($status !== 'scheduled') {
            $data['published_at'] = null;
        }

        $post = BlogPost::query()->create($data);
        $post->tags()->sync($this->resolveTagIds($tags));

        $message = $status === 'published' ? 'misc.blog_post_published' : 'misc.blog_post_saved';

        return to_route('admin.blog.posts.index')->with('success', $message);
    }

    public function edit(BlogPost $post): Response
    {
        $categoryQuery = new BlogCategoryIndexQuery;
        $post->load('category', 'author', 'tags');

        return inertia('admin/blog/posts/edit', [
            'post' => array_merge($post->toArray(), [
                'title' => $post->getTranslations('title'),
                'slug' => $post->getTranslations('slug'),
                'excerpt' => $post->getTranslations('excerpt'),
                'content' => $post->getTranslations('content'),
                'content_json' => $post->content_json,
                'available_locales' => $post->available_locales,
                'tag_list' => $post->tags->pluck('name')->values()->all(),
            ]),
            'categories' => $categoryQuery->categoriesForSelect(),
            'available_tags' => Tag::query()->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function update(UpdateBlogPostRequest $request, BlogPost $post): RedirectResponse
    {
        $data = $request->validated();
        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        $titleForSlug = is_array($data['title'])
            ? ($data['title'][config('app.locale')] ?? array_values($data['title'])[0] ?? '')
            : (string) ($data['title'] ?? '');
        if (empty($data['slug']) || (is_array($data['slug']) && array_filter($data['slug']) === [])) {
            $data['slug'] = [config('app.locale') => Str::slug($titleForSlug) ?: 'untitled'];
        }

        $data['is_featured'] ??= false;
        $contentForEstimate = is_array($data['content'])
            ? ($data['content'][config('app.locale')] ?? array_values($data['content'])[0] ?? '')
            : (string) ($data['content'] ?? '');
        $data['reading_time'] = (new BlogPost)->estimateReadingTime($contentForEstimate);

        $status = $data['status'] ?? 'draft';

        if ($status === 'published' && $post->published_at === null) {
            $data['published_at'] ??= now();
        } elseif ($status !== 'scheduled' && $status !== 'published') {
            $data['published_at'] = null;
        }

        $post->update($data);
        $post->tags()->sync($this->resolveTagIds($tags));

        $message = $status === 'published' ? 'misc.blog_post_updated' : 'misc.blog_post_saved';

        return back()->with('success', $message);
    }

    public function destroy(BlogPost $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', 'misc.blog_post_deleted');
    }

    public function publish(BlogPost $post): RedirectResponse
    {
        $post->update([
            'status' => BlogPostStatusEnum::Published,
            'published_at' => $post->published_at ?? now(),
        ]);

        return back()->with('success', 'misc.blog_post_published');
    }

    public function unpublish(BlogPost $post): RedirectResponse
    {
        $post->update(['status' => BlogPostStatusEnum::Draft]);

        return back()->with('success', 'misc.blog_post_unpublished');
    }

    public function toggleFeatured(BlogPost $post): RedirectResponse
    {
        $post->update(['is_featured' => ! $post->is_featured]);

        $message = $post->is_featured ? 'misc.blog_post_featured' : 'misc.blog_post_unfeatured';

        return back()->with('success', $message);
    }

    /** @param array<int, string> $tagNames */
    private function resolveTagIds(array $tagNames): array
    {
        return collect($tagNames)
            ->filter()
            ->map(fn (string $name): int => Tag::query()->firstOrCreate(['slug' => Str::slug($name)], ['name' => $name])->id)
            ->unique()
            ->values()
            ->all();
    }
}
