<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Page;
use App\Services\Hooks\Cms\PagePublishedAction;
use App\Services\Hooks\Facades\Hook;

final readonly class PagePublicationWebhookService
{
    public function __construct(
        private WebhookService $webhookService,
        private StorefrontPathService $storefrontPathService,
    ) {}

    public function dispatchPublished(Page $page, string $source): void
    {
        $this->webhookService->dispatch('page.published', $this->payload($page, $source));
        Hook::action(new PagePublishedAction($page));
    }

    public function dispatchUnpublished(Page $page, string $source): void
    {
        $this->webhookService->dispatch('page.unpublished', $this->payload($page, $source));
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Page $page, string $source): array
    {
        $frontendUrl = mb_rtrim((string) config('app.frontend_url', ''), '/');
        $path = $this->storefrontPathService->pagePath($page, config('app.locale'));

        $paths = [];
        foreach (array_keys($page->getTranslations('slug')) as $locale) {
            $paths[$locale] = $this->storefrontPathService->pagePath($page, $locale);
        }

        return [
            'type' => 'page',
            'id' => $page->id,
            'title' => $page->getTranslations('title'),
            'slug' => $page->slug,
            'slug_translations' => $page->getTranslations('slug'),
            'path' => $path,
            'paths' => $paths,
            'url' => $frontendUrl !== '' ? $frontendUrl.$path : $path,
            'is_published' => $page->is_published,
            'published_at' => $page->published_at?->toIso8601String(),
            'published_version_id' => $page->published_version_id,
            'source' => $source,
        ];
    }
}
