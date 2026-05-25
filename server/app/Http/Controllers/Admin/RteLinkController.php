<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\BlogPostStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RteLinkValidateRequest;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Locale;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
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

        /** @var Collection<int, Page> $pages */
        $pages = Page::query()
            ->where(function ($builder) use ($like): void {
                $builder->where('title', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->limit(6)
            ->get(['id', 'title', 'slug', 'is_published']);

        $pages->each(function (Page $page) use (&$results, $locale): void {
            $slug = mb_trim($page->slug, '/');
            $results[] = [
                'type' => 'page',
                'id' => $page->id,
                'label' => $page->getTranslation('title', $locale, false) ?: $page->title,
                'meta' => $page->is_published ? 'Published page' : 'Draft page',
                'url' => $slug === '' ? sprintf('/%s', $locale) : sprintf('/%s/%s', $locale, $slug),
            ];
        });

        /** @var Collection<int, Product> $products */
        $products = Product::query()
            ->where(function ($builder) use ($like): void {
                $builder->where('name', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->limit(6)
            ->get(['id', 'name', 'slug', 'is_active']);

        $products->each(function (Product $product) use (&$results, $locale): void {
            $results[] = [
                'type' => 'product',
                'id' => $product->id,
                'label' => $product->getTranslation('name', $locale, false) ?: $product->name,
                'meta' => $product->is_active ? 'Active product' : 'Inactive product',
                'url' => sprintf('/%s/products/%s', $locale, $product->slug),
            ];
        });

        /** @var Collection<int, Category> $categories */
        $categories = Category::query()
            ->where(function ($builder) use ($like): void {
                $builder->where('name', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->limit(6)
            ->get(['id', 'name', 'slug', 'is_active']);

        $categories->each(function (Category $category) use (&$results, $locale): void {
            $results[] = [
                'type' => 'category',
                'id' => $category->id,
                'label' => $category->getTranslation('name', $locale, false) ?: $category->name,
                'meta' => $category->is_active ? 'Active category' : 'Inactive category',
                'url' => sprintf('/%s/categories/%s', $locale, $category->slug),
            ];
        });

        /** @var Collection<int, BlogPost> $posts */
        $posts = BlogPost::query()
            ->where(function ($builder) use ($like): void {
                $builder->where('title', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->limit(6)
            ->get(['id', 'title', 'slug', 'status']);

        $posts->each(function (BlogPost $post) use (&$results, $locale): void {
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

    public function validateUrls(RteLinkValidateRequest $request): JsonResponse
    {
        $urls = collect($request->validated('urls'))
            ->map(fn (string $url): string => mb_trim($url))
            ->filter()
            ->unique()
            ->values();

        return response()->json([
            'results' => $urls
                ->map(fn (string $url): array => [
                    'url' => $url,
                    'valid' => $this->isValidInternalUrl($url),
                ])
                ->values()
                ->all(),
        ]);
    }

    private function isValidInternalUrl(string $url): bool
    {
        if (! str_starts_with($url, '/') || str_starts_with($url, '//')) {
            return true;
        }

        $path = parse_url($url, PHP_URL_PATH);
        if (! is_string($path)) {
            return false;
        }

        $segments = array_values(array_filter(explode('/', mb_trim($path, '/')), fn (string $segment): bool => $segment !== ''));
        if ($segments === []) {
            return true;
        }

        $locale = $this->extractLocale($segments);

        if ($segments === []) {
            return true;
        }

        return match ($segments[0]) {
            'products' => $this->productExists($segments[1] ?? null),
            'categories' => $this->categoryExists($segments[1] ?? null),
            'blog' => $this->blogPostExists($segments[1] ?? null, $locale),
            default => Page::findByLocalizedPath($segments, $locale) instanceof Page,
        };
    }

    /**
     * @param  array<int, string>  $segments
     */
    private function extractLocale(array &$segments): string
    {
        $defaultLocale = config('app.locale', 'en');
        $locales = Locale::query()->where('is_active', true)->pluck('code')->all();
        $candidate = $segments[0] ?? null;

        if (is_string($candidate) && in_array($candidate, $locales, true)) {
            array_shift($segments);

            return $candidate;
        }

        return is_string($defaultLocale) ? $defaultLocale : 'en';
    }

    private function productExists(?string $slug): bool
    {
        if ($slug === null || $slug === '') {
            return false;
        }

        return Product::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->exists();
    }

    private function categoryExists(?string $slug): bool
    {
        if ($slug === null || $slug === '') {
            return false;
        }

        return Category::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->exists();
    }

    private function blogPostExists(?string $slug, string $locale): bool
    {
        if ($slug === null || $slug === '') {
            return false;
        }

        return BlogPost::query()
            ->where('status', BlogPostStatusEnum::Published)
            ->where(function ($query) use ($slug, $locale): void {
                $query->where('slug', $slug)
                    ->orWhere('slug_translations->'.$locale, $slug);
            })
            ->exists();
    }
}
