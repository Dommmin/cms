<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Address
 */
class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Address $address */
        $address = $this->resource;

        return [
            'id' => $address->id,
            'type' => $address->type->value,
            'first_name' => $address->first_name,
            'last_name' => $address->last_name,
            'company_name' => $address->company_name,
            'street' => $address->street,
            'street2' => $address->street2,
            'city' => $address->city,
            'postal_code' => $address->postal_code,
            'country_code' => $address->country_code,
            'phone' => $address->phone,
            'is_default' => $address->is_default,
            'full_address' => $address->fullAddress(),
        ];
    }
}
