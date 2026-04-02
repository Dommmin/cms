<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\Json\ResourceCollection;

class ProductCollection extends ResourceCollection
{
    public $collects = ProductResource::class;

    public function paginationInformation($request, $paginated, array $default): array
    {
        if (isset($this->additional['available_filters'])) {
            $default['meta']['available_filters'] = $this->additional['available_filters'];
        }

        return $default;
    }
}
