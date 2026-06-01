<?php

declare(strict_types=1);

namespace App\Models\Builders;

use App\Enums\AddressTypeEnum;
use App\Models\Address;
use Illuminate\Database\Eloquent\Builder;

/**
 * @template TModelClass of Address
 *
 * @extends Builder<TModelClass>
 */
class AddressBuilder extends Builder
{
    /**
     * Find an existing address matching the provided details.
     *
     * @param  array<string, mixed>  $mapped
     */
    public function findMatchingAddress(int $customerId, AddressTypeEnum $type, array $mapped): ?Address
    {
        /** @var Address|null */
        return $this->where('customer_id', $customerId)
            ->where('type', $type->value)
            ->where('first_name', $mapped['first_name'] ?? null)
            ->where('last_name', $mapped['last_name'] ?? null)
            ->where('company_name', $mapped['company_name'] ?? null)
            ->where('street', $mapped['street'] ?? null)
            ->where('street2', $mapped['street2'] ?? null)
            ->where('city', $mapped['city'] ?? null)
            ->where('postal_code', $mapped['postal_code'] ?? null)
            ->where('country_code', $mapped['country_code'] ?? null)
            ->where('phone', $mapped['phone'] ?? null)
            ->first();
    }
}
