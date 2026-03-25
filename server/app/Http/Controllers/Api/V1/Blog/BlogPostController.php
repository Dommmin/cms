<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Blog;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BlogPostResource;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $locale = $request->query('locale', app()->getLocale());

        $posts = BlogPost::query()->published()
            ->with(['author:id,name', 'category:id,name,slug'])
            ->where(function ($q) use ($locale): void {
                $q->whereNull('available_locales')
                    ->orWhereJsonContains('available_locales', $locale);
            })
            ->when($request->category, fn ($q, $slug) => $q->whereHas(
                'category', fn ($c) => $c->where('slug', $slug)
            ))
            ->when($request->featured, fn ($q) => $q->featured())
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search): void {
                $q->where('title', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('excerpt', 'like', sprintf('%%%s%%', $search));
            }))
            ->latest('published_at')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return response()->json(BlogPostResource::collection($posts)->response()->getData(true));
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $locale = $request->query('locale', app()->getLocale());

        $post = BlogPost::query()->published()
            ->where('slug', $slug)
            ->where(function ($q) use ($locale): void {
                $q->whereNull('available_locales')
                    ->orWhereJsonContains('available_locales', $locale);
            })
            ->with(['author:id,name', 'category:id,name,slug'])
            ->firstOrFail();

        $post->incrementViews();

        return response()->json(['data' => new BlogPostResource($post)]);
    }

    public function byCategory(Request $request, string $slug): JsonResponse
    {
        $locale = $request->query('locale', app()->getLocale());

        $category = BlogCategory::query()->active()->where('slug', $slug)->firstOrFail();

        $posts = BlogPost::query()->published()
            ->where('blog_category_id', $category->id)
            ->where(function ($q) use ($locale): void {
                $q->whereNull('available_locales')
                    ->orWhereJsonContains('available_locales', $locale);
            })
            ->with(['author:id,name', 'category:id,name,slug'])
            ->latest('published_at')
            ->paginate(15)
            ->withQueryString();

        return response()->json(BlogPostResource::collection($posts)->response()->getData(true));
    }
}
