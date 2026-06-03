<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Data\CategoryData;
use App\Models\Category;
use App\Services\StorefrontPathService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Category
 */
class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = CategoryData::from($this->resource)->toArray();
        $data['image_url'] = $data['image_path'] ?? null;
        $data['public_url'] = resolve(StorefrontPathService::class)->categoryPath($this->resource);
        unset($data['image_path']);

        return $data;
    }
}
