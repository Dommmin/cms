<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Metafield;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Metafield
 */
class MetafieldResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Metafield $metafield */
        $metafield = $this->resource;

        return [
            'id' => $metafield->id,
            'namespace' => $metafield->namespace,
            'key' => $metafield->key,
            'type' => $metafield->type,
            'value' => $metafield->value,
            'description' => $metafield->description,
            'casted_value' => $metafield->getCastedValue(),
        ];
    }
}
