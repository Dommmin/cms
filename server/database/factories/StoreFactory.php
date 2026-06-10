<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Store>
 */
class StoreFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(4),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'country' => 'PL',
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'opening_hours' => [
                'Mon-Fri' => '9:00-18:00',
                'Sat' => '10:00-14:00',
            ],
            'lat' => fake()->latitude(49.0, 54.9),
            'lng' => fake()->longitude(14.1, 24.2),
            'is_active' => true,
        ];
    }
}
