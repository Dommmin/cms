<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Services;

use Illuminate\Support\Facades\DB;

/**
 * Preset Service
 * Applies predefined configurations for different site types
 * Used for quick client setup (5 minutes)
 */
final class PresetService
{
    public function __construct(
        private readonly FeatureFlagService $featureFlagService
    ) {}

    /**
     * Apply a preset configuration
     */
    public function applyPreset(string $preset): void
    {
        match ($preset) {
            'landing' => $this->applyLandingPreset(),
            'shop' => $this->applyShopPreset(),
            'blog' => $this->applyBlogPreset(),
            'corporate' => $this->applyCorporatePreset(),
            default => throw new \InvalidArgumentException("Unknown preset: {$preset}"),
        };
    }

    private function applyLandingPreset(): void
    {
        // Set feature flags
        $this->featureFlagService->disable('blog');
        $this->featureFlagService->disable('ecommerce');
        $this->featureFlagService->disable('reviews');
        $this->featureFlagService->enable('newsletter');

        // Seed landing page content
        $this->seedLandingPage();
    }

    private function applyShopPreset(): void
    {
        // Set feature flags
        $this->featureFlagService->disable('blog');
        $this->featureFlagService->enable('ecommerce');
        $this->featureFlagService->enable('reviews');
        $this->featureFlagService->enable('newsletter');

        // Seed shop structure
        $this->seedCategories();
        $this->seedShippingMethods();
        $this->seedPaymentMethods();
    }

    private function applyBlogPreset(): void
    {
        // Set feature flags
        $this->featureFlagService->enable('blog');
        $this->featureFlagService->disable('ecommerce');
        $this->featureFlagService->disable('reviews');
        $this->featureFlagService->enable('newsletter');

        // Seed blog structure
        $this->seedBlogCategories();
        $this->seedSamplePosts();
    }

    private function applyCorporatePreset(): void
    {
        // Set feature flags
        $this->featureFlagService->enable('blog');
        $this->featureFlagService->disable('ecommerce');
        $this->featureFlagService->disable('reviews');
        $this->featureFlagService->enable('newsletter');

        // Seed corporate pages
        $this->seedCorporatePages();
    }

    // Helper methods
    private function seedLandingPage(): void
    {
        if (!DB::table('static_pages')->where('slug', 'home')->exists()) {
            DB::table('static_pages')->insert([
                'title' => 'Strona główna',
                'slug' => 'home',
                'content' => '<h1>Witamy</h1><p>Twój partner w biznesie</p>',
                'is_published' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function seedCategories(): void
    {
        // TODO: Seed product categories
    }

    private function seedShippingMethods(): void
    {
        // TODO: Seed shipping methods
    }

    private function seedPaymentMethods(): void
    {
        // TODO: Seed payment methods
    }

    private function seedBlogCategories(): void
    {
        // TODO: Seed blog categories
    }

    private function seedSamplePosts(): void
    {
        // TODO: Seed sample blog posts
    }

    private function seedCorporatePages(): void
    {
        // TODO: Seed corporate pages (About, Contact, etc.)
    }
}

