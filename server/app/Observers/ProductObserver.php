<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Product;
use App\Services\StorefrontPathService;
use App\Services\WebhookService;
use Illuminate\Support\Facades\Cache;
use Throwable;

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

            return;
        }

        if ($product->is_active) {
            $this->dispatchProductWebhook($product, 'product.updated');
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
        $product->loadMissing('category', 'brand');
        $path = $storefrontPathService->productPath($product, config('app.locale'));

        /** @var array<string, string> $paths */
        $paths = [];
        foreach (array_keys($product->getTranslations('slug')) as $locale) {
            $paths[$locale] = $storefrontPathService->productPath($product, $locale);
            $paths['search:'.$locale] = $storefrontPathService->searchPath($locale);
            $paths['compare:'.$locale] = $locale === config('app.locale')
                ? '/compare'
                : sprintf('/%s/compare', $locale);

            $this->rememberPath($paths, 'product_listing:'.$locale, fn (): string => $storefrontPathService->productListingPath($locale));
            $this->rememberPath($paths, 'category_listing:'.$locale, fn (): string => $storefrontPathService->categoryListingPath($locale));
            $this->rememberPath($paths, 'brand_listing:'.$locale, fn (): string => $storefrontPathService->brandListingPath($locale));

            if (! empty($product->category_id)) {
                $this->rememberPath($paths, 'category:'.$locale, fn (): string => $storefrontPathService->categoryPath($product->category, $locale));
            }

            if ($product->brand !== null) {
                $this->rememberPath($paths, 'brand:'.$locale, fn (): string => $storefrontPathService->brandPath($product->brand, $locale));
            }
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

    /**
     * @param  array<string, mixed>  $paths
     */
    private function rememberPath(array &$paths, string $key, callable $resolver): void
    {
        try {
            $paths[$key] = $resolver();
        } catch (Throwable) {
            // Optional storefront routes should not block product revalidation.
        }
    }
}
