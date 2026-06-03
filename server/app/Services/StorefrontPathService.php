<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\BlogPost;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;

class StorefrontPathService
{
    public function pagePath(Page $page, ?string $locale = null): string
    {
        return $page->localizedPath($locale ?? app()->getLocale());
    }

    public function systemPagePath(
        string $systemPageKey,
        ?string $locale = null,
        ?string $fallback = null,
    ): ?string {
        $page = Page::findPublishedBySystemPageKey(
            $systemPageKey,
            $locale ?? app()->getLocale(),
        );

        if ($page instanceof Page) {
            return $this->pagePath($page, $locale);
        }

        return $fallback;
    }

    public function productListingPath(?string $locale = null): string
    {
        return $this->systemPagePath('product_listing', $locale, '/products') ?? '/products';
    }

    public function categoryListingPath(?string $locale = null): string
    {
        return $this->systemPagePath('category_listing', $locale, '/categories') ?? '/categories';
    }

    public function brandListingPath(?string $locale = null): string
    {
        return $this->systemPagePath('brand_listing', $locale, '/brands') ?? '/brands';
    }

    public function blogListingPath(?string $locale = null): string
    {
        return $this->systemPagePath('blog_listing', $locale, '/blog') ?? '/blog';
    }

    public function searchPath(?string $locale = null): string
    {
        return $this->systemPagePath('search_results', $locale, '/search') ?? '/search';
    }

    public function productPath(Product $product, ?string $locale = null): string
    {
        return sprintf(
            '%s/%s',
            mb_rtrim($this->productListingPath($locale), '/'),
            $this->localizedValue($product->slug, $locale),
        );
    }

    public function categoryPath(Category $category, ?string $locale = null): string
    {
        return sprintf(
            '%s/%s',
            mb_rtrim($this->categoryListingPath($locale), '/'),
            $this->localizedValue($category->slug, $locale),
        );
    }

    public function brandPath(Brand $brand, ?string $locale = null): string
    {
        return sprintf(
            '%s/%s',
            mb_rtrim($this->brandListingPath($locale), '/'),
            $brand->slug,
        );
    }

    public function blogPostPath(BlogPost $post, ?string $locale = null): string
    {
        return sprintf(
            '%s/%s',
            mb_rtrim($this->blogListingPath($locale), '/'),
            $this->localizedValue($post->slug, $locale),
        );
    }

    /**
     * @param  array<string, string>|string|null  $value
     */
    private function localizedValue(array|string|null $value, ?string $locale = null): string
    {
        if (is_string($value)) {
            return $value;
        }

        if (! is_array($value) || $value === []) {
            return '';
        }

        $resolvedLocale = $locale ?? app()->getLocale();

        return (string) ($value[$resolvedLocale] ?? $value[config('app.locale')] ?? reset($value));
    }
}
