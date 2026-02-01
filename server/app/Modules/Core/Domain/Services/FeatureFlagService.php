<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Services;

use App\Modules\Core\Domain\Models\Setting;

/**
 * Feature Flags Service
 * Controls which modules are enabled/disabled
 * Used for license control and configuration
 */
final class FeatureFlagService
{
    private const FEATURE_GROUP = 'features';

    /**
     * Check if a feature is enabled
     */
    public function isEnabled(string $feature): bool
    {
        return (bool) Setting::get(self::FEATURE_GROUP, $feature, false);
    }

    /**
     * Enable a feature
     */
    public function enable(string $feature): void
    {
        Setting::set(self::FEATURE_GROUP, $feature, true);
    }

    /**
     * Disable a feature
     */
    public function disable(string $feature): void
    {
        Setting::set(self::FEATURE_GROUP, $feature, false);
    }

    /**
     * Get all features status
     */
    public function getAll(): array
    {
        return [
            'blog' => $this->isEnabled('blog'),
            'ecommerce' => $this->isEnabled('ecommerce'),
            'reviews' => $this->isEnabled('reviews'),
            'newsletter' => $this->isEnabled('newsletter'),
        ];
    }

    /**
     * Check if client has license for feature
     * Can be extended with license verification API
     */
    public function hasLicense(string $feature): bool
    {
        // Basic check - if feature is enabled
        if (!$this->isEnabled($feature)) {
            return false;
        }

        // TODO: Can add license verification via API
        // if (config('app.license_verification_enabled')) {
        //     return $this->verifyLicense($feature);
        // }

        return true;
    }
}

