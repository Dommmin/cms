<?php

declare(strict_types=1);

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Core CMS (always seeded) ─────────────────────────────────────────
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            FormSeeder::class,
            PagesDemoSeeder::class,
            SectionTemplateSeeder::class,
            ThemeSeeder::class,
            SettingsSeeder::class,
            MenuSeeder::class,
            BlogSeeder::class,
            LocaleSeeder::class,
            TranslationSeeder::class,
            DashboardWidgetSeeder::class,
        ]);

        // ── E-commerce (seeded only when module is active) ───────────────────
        if (config('modules.ecommerce')) {
            $this->call([
                ProductTypeSeeder::class,
                // EcommerceDemoSeeder::class,
                ElectronicsSeeder::class,
                DiscountSeeder::class,
                PromotionSeeder::class,
                ShippingMethodSeeder::class,
                CurrencySeeder::class,
                EmailTemplateSeeder::class,
            ]);
        }

        // ── Newsletter (seeded only when module is active) ───────────────────
        // (no dedicated newsletter seeder at this time)
    }
}
