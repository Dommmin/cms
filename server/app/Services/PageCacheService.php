<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ContentEntry;
use App\Models\Page;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class PageCacheService
{
    public function __construct(
        private readonly BlockMediaResolver $mediaResolver
    ) {}

    /**
     * Get cached page data
     *
     * @return array<string, mixed>|null
     */
    public function getCachedPage(string $slug): ?array
    {
        $locale = app()->getLocale();

        return Cache::remember(
            'page:'.$locale.':'.$slug,
            now()->addHours(24),
            function () use ($slug, $locale): ?array {
                $page = Page::query()
                    ->where('slug->'.$locale, $slug)
                    ->where('is_published', true)
                    ->withFullContent()
                    ->first();

                if (! $page) {
                    return null;
                }

                return $this->formatPageData($page);
            }
        );
    }

    /**
     * Invalidate page cache
     */
    public function invalidatePage(Page $page): void
    {
        $this->forgetPageCache($page);

        // Also invalidate parent pages if this is a child page
        if ($page->parent_id) {
            $parent = Page::query()->find($page->parent_id);
            if ($parent) {
                $this->forgetPageCache($parent);
            }
        }

        // Invalidate children pages
        /** @var Collection<int, Page> $children */
        $children = $page->children()->get(['id', 'slug']);
        foreach ($children as $child) {
            $this->forgetPageCache($child);
        }
    }

    /**
     * Invalidate all pages cache
     */
    public function invalidateAll(): void
    {
        Cache::flush();
    }

    private function forgetPageCache(Page $page): void
    {
        foreach (array_keys($page->getTranslations('slug')) as $locale) {
            Cache::forget('page:'.$locale.':'.$page->getTranslation('slug', $locale, false));
        }
    }

    /**
     * Format page data for API response
     *
     * @return array<string, mixed>
     */
    private function formatPageData(Page $page): array
    {
        $data = [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'excerpt' => $page->excerpt,
            'layout' => $page->layout->value,
            'page_type' => $page->page_type->value,
            'seo_title' => $page->seo_title,
            'seo_description' => $page->seo_description,
            'theme' => $page->theme ? [
                'id' => $page->theme->id,
                'slug' => $page->theme->slug,
                'tokens' => $page->theme->tokens,
                'settings' => $page->theme->settings,
            ] : null,
        ];

        // Dla modułu content - content z ContentEntry jest dodawany w PageController; cache trzyma pełną odpowiedź
        if ($page->isContentModule()) {
            $contentId = (int) ($page->module_config['content_id'] ?? 0);
            if ($contentId > 0) {
                $entry = ContentEntry::query()->find($contentId);
                $data['content'] = $entry?->content;
            }
        }

        // Dla typu blocks - zwróć bloki
        if ($page->isBlocksType()) {
            if ($page->sections->isNotEmpty()) {
                $data['sections'] = $page->sections->map(fn ($section): array => [
                    'id' => $section->id,
                    'section_type' => $section->section_type,
                    'layout' => $section->layout,
                    'variant' => $section->variant,
                    'settings' => $section->settings,
                    'position' => $section->position,
                    'blocks' => $section->blocks->map(fn ($block): array => [
                        'id' => $block->id,
                        'type' => $block->type->value,
                        'configuration' => $this->mediaResolver->resolveInConfiguration(
                            $block->configuration ?? [],
                            $block->type->value
                        ),
                        'position' => $block->position,
                    ])->all(),
                ])->all();
            } else {
                $data['sections'] = [
                    [
                        'id' => null,
                        'section_type' => null,
                        'layout' => 'default',
                        'variant' => null,
                        'settings' => null,
                        'position' => 0,
                        'blocks' => $page->blocks->map(fn ($block): array => [
                            'id' => $block->id,
                            'type' => $block->type->value,
                            'configuration' => $this->mediaResolver->resolveInConfiguration(
                                $block->configuration ?? [],
                                $block->type->value
                            ),
                            'position' => $block->position,
                        ])->all(),
                    ],
                ];
            }
        }

        // Dla typu module - zwróć konfigurację modułu
        if ($page->isModuleType()) {
            $data['module_name'] = $page->module_name;
            $data['module_config'] = $page->module_config;
        }

        return $data;
    }
}
