<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RteLinkController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = mb_trim($request->string('q')->value());
        $locale = $request->string('locale', 'en')->value();

        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }

        $like = sprintf('%%%s%%', $query);
        $results = [];

        Page::query()
            ->where(function ($builder) use ($like): void {
                $builder->where('title', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->limit(6)
            ->get(['id', 'title', 'slug', 'is_published'])
            ->each(function (Page $page) use (&$results, $locale): void {
                $slug = trim($page->slug, '/');
                $results[] = [
                    'type' => 'page',
                    'id' => $page->id,
                    'label' => $page->getTranslation('title', $locale, false) ?: $page->title,
                    'meta' => $page->is_published ? 'Published page' : 'Draft page',
                    'url' => $slug === '' ? sprintf('/%s', $locale) : sprintf('/%s/%s', $locale, $slug),
                ];
            });

        Product::query()
            ->where(function ($builder) use ($like): void {
                $builder->where('name', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->limit(6)
            ->get(['id', 'name', 'slug', 'is_active'])
            ->each(function (Product $product) use (&$results, $locale): void {
                $results[] = [
                    'type' => 'product',
                    'id' => $product->id,
                    'label' => $product->getTranslation('name', $locale, false) ?: $product->name,
                    'meta' => $product->is_active ? 'Active product' : 'Inactive product',
                    'url' => sprintf('/%s/products/%s', $locale, $product->slug),
                ];
            });

        Category::query()
            ->where(function ($builder) use ($like): void {
                $builder->where('name', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->limit(6)
            ->get(['id', 'name', 'slug', 'is_active'])
            ->each(function (Category $category) use (&$results, $locale): void {
                $results[] = [
                    'type' => 'category',
                    'id' => $category->id,
                    'label' => $category->getTranslation('name', $locale, false) ?: $category->name,
                    'meta' => $category->is_active ? 'Active category' : 'Inactive category',
                    'url' => sprintf('/%s/categories/%s', $locale, $category->slug),
                ];
            });

        BlogPost::query()
            ->where(function ($builder) use ($like): void {
                $builder->where('title', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->limit(6)
            ->get(['id', 'title', 'slug', 'status'])
            ->each(function (BlogPost $post) use (&$results, $locale): void {
                $results[] = [
                    'type' => 'blog_post',
                    'id' => $post->id,
                    'label' => $post->getTranslation('title', $locale, false) ?: $post->title,
                    'meta' => sprintf('Blog post · %s', is_string($post->status) ? $post->status : $post->status?->value),
                    'url' => sprintf('/%s/blog/%s', $locale, $post->slug),
                ];
            });

        return response()->json($results);
    }
}
