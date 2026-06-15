<?php

declare(strict_types=1);

namespace App\Services\PageBuilder;

use App\Models\Category;
use App\Models\Page;

final class PageRenderContextResolver
{
    /**
     * @param  list<string>  $segments
     */
    public function resolve(Page $page, array $segments, string $locale): PageRenderContext
    {
        $categoryId = $this->resolveCategoryIdFromPath($page, $segments, $locale);

        return new PageRenderContext(currentCategoryId: $categoryId);
    }

    /**
     * @param  list<string>  $segments
     */
    private function resolveCategoryIdFromPath(Page $page, array $segments, string $locale): ?int
    {
        if (! $this->pageHasCategoryListingAncestor($page)) {
            return null;
        }

        $pageSegmentCount = $this->countPagePathSegments($page, $locale);

        if (count($segments) <= $pageSegmentCount) {
            return null;
        }

        $categorySlug = $segments[$pageSegmentCount];

        if (! is_string($categorySlug) || $categorySlug === '') {
            return null;
        }

        $categoryId = Category::query()
            ->where('slug->'.$locale, $categorySlug)
            ->where('is_active', true)
            ->value('id');

        return is_int($categoryId) ? $categoryId : null;
    }

    private function pageHasCategoryListingAncestor(Page $page): bool
    {
        $current = $page;

        while (true) {
            if ($current->module_name === 'category_listing') {
                return true;
            }

            if ($current->parent_id === null) {
                return false;
            }

            $parent = Page::query()->find($current->parent_id);

            if (! $parent instanceof Page) {
                return false;
            }

            $current = $parent;
        }
    }

    private function countPagePathSegments(Page $page, string $locale): int
    {
        $segments = 0;
        $current = $page;

        while (true) {
            $slug = $current->getTranslation('slug', $locale, false);

            if (is_string($slug) && $slug !== '') {
                $segments++;
            }

            if ($current->parent_id === null) {
                break;
            }

            $parent = Page::query()->find($current->parent_id);

            if (! $parent instanceof Page) {
                break;
            }

            $current = $parent;
        }

        return $segments;
    }
}
