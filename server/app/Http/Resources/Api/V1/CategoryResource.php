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
        return CategoryData::from($this->resource)->toArray();
    }
}
