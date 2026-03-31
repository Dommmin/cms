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
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            ProductTypeSeeder::class,
            // EcommerceDemoSeeder::class,
            ElectronicsSeeder::class,
            DiscountSeeder::class,
            PromotionSeeder::class,
            FormSeeder::class,
            PagesDemoSeeder::class,
            SectionTemplateSeeder::class,
            ThemeSeeder::class,
            SettingsSeeder::class,
            ShippingMethodSeeder::class,
            MenuSeeder::class,
            BlogSeeder::class,
            CurrencySeeder::class,
            LocaleSeeder::class,
            TranslationSeeder::class,
            DashboardWidgetSeeder::class,
        ]);
    }
}
