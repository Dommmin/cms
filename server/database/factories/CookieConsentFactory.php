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
            'session_id' => fake()->uuid(),
            'user_id' => null,
            'category' => fake()->randomElement(['functional', 'analytics', 'marketing']),
            'granted' => fake()->boolean(),
            'ip' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'consent_version' => 'v1',
        ];
    }
}
