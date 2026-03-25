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
        $name = $this->faker->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(4),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'country' => 'PL',
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->companyEmail(),
            'opening_hours' => [
                'Mon-Fri' => '9:00-18:00',
                'Sat' => '10:00-14:00',
            ],
            'lat' => $this->faker->latitude(49.0, 54.9),
            'lng' => $this->faker->longitude(14.1, 24.2),
            'is_active' => true,
        ];
    }
}
