<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\ShippingMethod;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ShippingMethod
 */
class ShippingMethodResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var ShippingMethod $method */
        $method = $this->resource;

        return [
            'id' => $method->id,
            'name' => $method->name,
            'carrier' => $method->carrier instanceof BackedEnum ? $method->carrier->value : $method->carrier,
            'base_cost' => $method->base_cost,
            'free_above' => $method->free_above,
            'estimated_days_min' => $method->estimated_days_min,
            'estimated_days_max' => $method->estimated_days_max,
        ];
    }
}
