<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Metafield;
use App\Models\Page;
use App\Models\Product;
use App\Services\MetafieldVisibilityService;
use App\Services\WebhookService;

class MetafieldObserver
{
    public function __construct(
        private readonly MetafieldVisibilityService $visibilityService,
        private readonly WebhookService $webhookService,
    ) {}

    public function created(Metafield $metafield): void
    {
        $this->dispatchIfPublic($metafield);
    }

    public function updated(Metafield $metafield): void
    {
        $this->dispatchIfPublic($metafield);
    }

    public function deleted(Metafield $metafield): void
    {
        $this->dispatchIfPublic($metafield);
    }

    private function dispatchIfPublic(Metafield $metafield): void
    {
        $owner = $metafield->owner;

        if (! $owner instanceof Product && ! $owner instanceof Category && ! $owner instanceof Page && ! $owner instanceof BlogPost) {
            return;
        }

        if (! $this->visibilityService->ownerIsPublic($owner)) {
            return;
        }

        if (! $this->visibilityService->isPublicMetafield($owner, $metafield->namespace, $metafield->key)) {
            return;
        }

        $event = $this->visibilityService->ownerRevalidationEvent($owner);
        $path = $this->visibilityService->ownerPath($owner, config('app.locale'));

        if ($event === null || $path === null) {
            return;
        }

        $frontendUrl = mb_rtrim((string) config('app.frontend_url', ''), '/');

        $paths = [];
        foreach (array_keys($owner->getTranslations('slug')) as $locale) {
            $paths[$locale] = $this->visibilityService->ownerPath($owner, $locale);
        }

        $this->webhookService->dispatch($event, [
            'type' => match ($owner::class) {
                Product::class => 'product',
                Category::class => 'category',
                Page::class => 'page',
                BlogPost::class => 'blog_post',
                default => 'metafield',
            },
            'id' => $owner->getKey(),
            'path' => $path,
            'paths' => array_filter($paths),
            'url' => $frontendUrl !== '' ? $frontendUrl.$path : $path,
            'updated_at' => $metafield->updated_at?->toIso8601String(),
            'metafield' => [
                'namespace' => $metafield->namespace,
                'key' => $metafield->key,
            ],
        ]);
    }
}
