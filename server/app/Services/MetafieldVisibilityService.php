<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\BlogPostStatusEnum;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Metafield;
use App\Models\MetafieldDefinition;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Support\Collection;

class MetafieldVisibilityService
{
    /**
     * @return Collection<int, MetafieldDefinition>
     */
    public function definitionsForOwner(string $ownerType): Collection
    {
        return MetafieldDefinition::query()
            ->forOwnerType($ownerType)
            ->orderByDesc('pinned')
            ->orderBy('position')
            ->orderBy('name')
            ->get();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function serializeDefinitions(string $ownerType): array
    {
        return $this->definitionsForOwner($ownerType)
            ->map(fn (MetafieldDefinition $definition): array => [
                'id' => $definition->id,
                'owner_type' => $definition->owner_type,
                'namespace' => $definition->namespace,
                'key' => $definition->key,
                'name' => $definition->name,
                'type' => $definition->type,
                'description' => $definition->description,
                'visibility' => $definition->visibility,
                'storefront_exposed' => (bool) $definition->storefront_exposed,
                'pinned' => (bool) $definition->pinned,
                'position' => $definition->position,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function serializeMetafieldsForOwner(Product|Category|Page|BlogPost $owner): array
    {
        $definitions = $this->definitionsForOwner($owner::class)
            ->keyBy(fn (MetafieldDefinition $definition): string => $this->definitionKey($definition->namespace, $definition->key));

        return $this->metafieldsForOwner($owner)
            ->map(function (Metafield $metafield) use ($definitions): array {
                $definition = $definitions->get($this->definitionKey($metafield->namespace, $metafield->key));

                return [
                    'id' => $metafield->id,
                    'namespace' => $metafield->namespace,
                    'key' => $metafield->key,
                    'type' => $metafield->type,
                    'value' => $metafield->value,
                    'description' => $metafield->description ?? $definition?->description,
                    'definition_id' => $definition?->id,
                    'definition_name' => $definition?->name,
                    'visibility' => $definition ? $definition->visibility : 'admin_only',
                    'storefront_exposed' => $definition && (bool) $definition->storefront_exposed,
                    'pinned' => $definition && (bool) $definition->pinned,
                    'position' => $definition ? $definition->position : 0,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return Collection<int, Metafield>
     */
    public function publicMetafieldsForOwner(Product|Category|Page|BlogPost $owner): Collection
    {
        $definitionKeys = $this->definitionsForOwner($owner::class)
            ->filter(fn (MetafieldDefinition $definition): bool => $definition->isPubliclyVisible())
            ->mapWithKeys(fn (MetafieldDefinition $definition): array => [
                $this->definitionKey($definition->namespace, $definition->key) => [
                    'pinned' => (bool) $definition->pinned,
                    'position' => $definition->position,
                ],
            ]);

        return $this->metafieldsForOwner($owner)
            ->filter(fn (Metafield $metafield): bool => $definitionKeys->has($this->definitionKey($metafield->namespace, $metafield->key)))
            ->sortBy(fn (Metafield $metafield): array => [
                (int) ($definitionKeys[$this->definitionKey($metafield->namespace, $metafield->key)]['pinned'] ?? 0) * -1,
                (int) ($definitionKeys[$this->definitionKey($metafield->namespace, $metafield->key)]['position'] ?? 0),
                $metafield->namespace,
                $metafield->key,
            ])
            ->values();
    }

    /**
     * @return Collection<int, Metafield>
     */
    public function metafieldsForOwner(Product|Category|Page|BlogPost $owner): Collection
    {
        if ($owner->relationLoaded('metafields')) {
            return $owner->metafields;
        }

        return $owner->metafields()->get();
    }

    public function isPublicMetafield(Product|Category|Page|BlogPost $owner, string $namespace, string $key): bool
    {
        return $this->definitionsForOwner($owner::class)
            ->first(
                fn (MetafieldDefinition $definition): bool => $definition->namespace === $namespace
                    && $definition->key === $key
                    && $definition->isPubliclyVisible(),
            ) instanceof MetafieldDefinition;
    }

    public function ownerRevalidationEvent(Product|Category|Page|BlogPost $owner): ?string
    {
        return match ($owner::class) {
            Product::class => 'product.updated',
            Category::class => 'category.updated',
            Page::class => 'page.updated',
            BlogPost::class => 'blog_post.updated',
            default => null,
        };
    }

    public function ownerPath(Product|Category|Page|BlogPost $owner, ?string $locale = null): ?string
    {
        $pathService = resolve(StorefrontPathService::class);

        return match ($owner::class) {
            Product::class => $pathService->productPath($owner, $locale),
            Category::class => $pathService->categoryPath($owner, $locale),
            Page::class => $pathService->pagePath($owner, $locale),
            BlogPost::class => $pathService->blogPostPath($owner, $locale),
            default => null,
        };
    }

    public function ownerIsPublic(Product|Category|Page|BlogPost $owner): bool
    {
        return match ($owner::class) {
            Product::class => (bool) $owner->is_active,
            Category::class => (bool) $owner->is_active,
            Page::class => (bool) $owner->is_published,
            BlogPost::class => $owner->status === BlogPostStatusEnum::Published,
            default => false,
        };
    }

    private function definitionKey(string $namespace, string $key): string
    {
        return $namespace.'::'.$key;
    }
}
