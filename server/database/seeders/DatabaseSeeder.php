<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Config;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Disable activity logging during seeding — no admin causer, massive noise.
        Config::set('activitylog.enabled', false);

        // ── Core CMS (always seeded) ─────────────────────────────────────────
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            FormSeeder::class,
            PagesDemoSeeder::class,
            ThemeSeeder::class,
            SettingsSeeder::class,
            MenuSeeder::class,
            BlogSeeder::class,
            LocaleSeeder::class,
            TranslationSeeder::class,
            DashboardWidgetSeeder::class,
        ]);

        // ── E-commerce ───────────────────────────────────────────────────────
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

        // ── Newsletter (seeded only when module is active) ───────────────────
        // (no dedicated newsletter seeder at this time)
    }
}
