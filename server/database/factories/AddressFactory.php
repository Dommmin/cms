<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\AddressTypeEnum;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Address>
 */
class AddressFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'type' => AddressTypeEnum::SHIPPING,
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'company_name' => null,
            'street' => fake()->streetAddress(),
            'street2' => null,
            'city' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'country_code' => 'PL',
            'phone' => fake()->phoneNumber(),
            'is_default' => false,
        ];
    }
}
