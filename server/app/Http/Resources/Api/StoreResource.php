<?php

declare(strict_types=1);

namespace App\Http\Resources\Api;

use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Store
 */
class StoreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Store $store */
        $store = $this->resource;

        return [
            'id' => $store->id,
            'name' => $store->name,
            'slug' => $store->slug,
            'address' => $store->address,
            'city' => $store->city,
            'country' => $store->country,
            'phone' => $store->phone,
            'email' => $store->email,
            'opening_hours' => $store->opening_hours,
            'lat' => (float) $store->lat,
            'lng' => (float) $store->lng,
        ];
    }
}
