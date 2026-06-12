<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        Setting::set('seo', 'og_image', 'https://images.unsplash.com/photo-1557821314-4a50fd44fc82?w=1200&auto=format&fit=crop');
    }
}
