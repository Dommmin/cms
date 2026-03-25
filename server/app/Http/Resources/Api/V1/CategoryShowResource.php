<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Data\CategoryData;
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
            'category' => $category instanceof CategoryData ? $category->toArray() : (array) $category,
            'breadcrumb' => collect($breadcrumb)->map(fn ($c): array => $c instanceof CategoryData ? $c->toArray() : (array) $c)->all(),
        ];
    }
}
