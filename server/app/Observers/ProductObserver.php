<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Product;
use App\Services\StorefrontPathService;
use App\Services\WebhookService;
use Illuminate\Support\Facades\Cache;

class ProductObserver
{
    public function created(Product $product): void
    {
        if ($product->is_active) {
            $this->dispatchProductWebhook($product, 'product.published');
        }
    }

    public function updated(Product $product): void
    {
        if ($product->wasChanged('is_active')) {
            $event = $product->is_active ? 'product.published' : 'product.unpublished';
            $this->dispatchProductWebhook($product, $event);
        }
    }

    public function saved(Product $product): void
    {
        Cache::tags(['products'])->flush();
    }

    public function deleted(Product $product): void
    {
        Cache::tags(['products'])->flush();
    }

    private function dispatchProductWebhook(Product $product, string $event): void
    {
        $frontendUrl = mb_rtrim((string) config('app.frontend_url', ''), '/');
        $storefrontPathService = resolve(StorefrontPathService::class);
        $path = $storefrontPathService->productPath($product, config('app.locale'));

        $paths = [];
        foreach (array_keys($product->getTranslations('slug')) as $locale) {
            $paths[$locale] = $storefrontPathService->productPath($product, $locale);
        }

        $payload = [
            'type' => 'product',
            'id' => $product->id,
            'name' => $product->getTranslations('name'),
            'slug' => $product->slug,
            'slug_translations' => $product->getTranslations('slug'),
            'path' => $path,
            'paths' => $paths,
            'url' => $frontendUrl !== '' ? $frontendUrl.$path : $path,
            'is_active' => $product->is_active,
            'updated_at' => $product->updated_at?->toIso8601String(),
        ];

        resolve(WebhookService::class)->dispatch($event, $payload);
    }
}
