<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Blog;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\BlogPostResource;
use App\Http\Resources\Api\V1\BlogResource;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends ApiController
{
    public function index(): JsonResponse
    {
        $blogs = Blog::query()
            ->active()
            ->withCount('posts')
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        return $this->ok(BlogResource::collection($blogs)->response()->getData(true));
    }

    public function show(string $slug, Request $request): JsonResponse
    {
        $blog = Blog::query()
            ->where('slug', $slug)
            ->active()
            ->firstOrFail();

        $posts = $blog->publishedPosts()
            ->with(['author', 'category', 'tags'])
            ->orderByDesc('published_at')
            ->paginate($blog->posts_per_page, ['*'], 'page', (int) $request->input('page', 1));

        return $this->ok([
            'blog' => new BlogResource($blog),
            'posts' => BlogPostResource::collection($posts)->response()->getData(true),
        ]);
    }

    public function posts(string $slug, Request $request): JsonResponse
    {
        $blog = Blog::query()
            ->where('slug', $slug)
            ->active()
            ->firstOrFail();

        $posts = $blog->publishedPosts()
            ->with(['author', 'category', 'tags'])
            ->orderByDesc('published_at')
            ->paginate($blog->posts_per_page, ['*'], 'page', (int) $request->input('page', 1));

        return $this->ok(BlogPostResource::collection($posts)->response()->getData(true));
    }
}
