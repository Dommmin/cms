<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Data\CategoryData;
use App\Models\Category;
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
        unset($data['image_path']);

        return $data;
    }
}
