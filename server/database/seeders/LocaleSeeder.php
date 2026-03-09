<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Locale;
use Illuminate\Database\Seeder;

class LocaleSeeder extends Seeder
{
    public function run(): void
    {
        $locales = [
            [
                'code' => 'en',
                'name' => 'English',
                'native_name' => 'English',
                'flag_emoji' => '🇬🇧',
                'is_default' => true,
                'is_active' => true,
            ],
            [
                'code' => 'pl',
                'name' => 'Polish',
                'native_name' => 'Polski',
                'flag_emoji' => '🇵🇱',
                'is_default' => false,
                'is_active' => true,
            ],
        ];

        foreach ($locales as $locale) {
            Locale::firstOrCreate(['code' => $locale['code']], $locale);
        }
    }
}
