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
            ThemeSeeder::class,
            SettingsSeeder::class,
            LocaleSeeder::class,
            TranslationSeeder::class,
            DashboardWidgetSeeder::class,
        ]);

        // ── E-commerce ───────────────────────────────────────────────────────
        $this->call([
            DefaultBlogSeeder::class,
            DemoCmsPageSeeder::class,
            AttributeDefinitionSeeder::class,
            CategoryAttributeSchemaSeeder::class,
            DemoProductSeeder::class,
            DemoProductVariantSeeder::class,
            DemoBlogSeeder::class,
            DemoCmsPageSeeder::class,
            DemoMetafieldSeeder::class,
            MenuSeeder::class,
            ProductTypeSeeder::class,
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
