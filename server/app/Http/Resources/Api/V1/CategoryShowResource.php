<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Data\CategoryData;
use App\Models\Category;
use App\Services\MetafieldVisibilityService;
use App\Services\StorefrontPathService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Single category with breadcrumb (show action).
 */
class CategoryShowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $payload = $this->resource;
        if (! is_array($payload)) {
            return (array) $payload;
        }

        $category = $payload['category'] ?? null;
        $breadcrumb = $payload['breadcrumb'] ?? [];

        return [
            'category' => $this->serializeCategory($category, $request),
            'breadcrumb' => collect($breadcrumb)
                ->map(fn ($c): array => $this->serializeCategory($c, $request))
                ->all(),
        ];
    }

    private function serializeCategory(mixed $category, Request $request): array
    {
        $data = $category instanceof CategoryData ? $category->toArray() : (array) $category;

        if ($category instanceof Category) {
            $data['public_url'] = resolve(StorefrontPathService::class)->categoryPath($category);
            if ($category->relationLoaded('metafields')) {
                $data['metafields'] = MetafieldResource::collection(
                    resolve(MetafieldVisibilityService::class)->publicMetafieldsForOwner($category)
                )->resolve($request);
            }
        }

        if (array_key_exists('image_path', $data)) {
            $data['image_url'] = $data['image_path'] ?? null;
            unset($data['image_path']);
        }

        return $data;
    }
}
