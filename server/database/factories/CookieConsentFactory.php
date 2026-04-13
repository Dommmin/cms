<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CookieConsent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CookieConsent>
 */
class CookieConsentFactory extends Factory
{
    protected $model = CookieConsent::class;

    public function definition(): array
    {
        return [
            'session_id' => $this->faker->uuid(),
            'user_id' => null,
            'category' => $this->faker->randomElement(['functional', 'analytics', 'marketing']),
            'granted' => $this->faker->boolean(),
            'ip' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'consent_version' => 'v1',
        ];
    }
}
