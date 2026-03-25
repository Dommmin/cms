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
                'currency_code' => 'USD',
                'is_default' => true,
                'is_active' => true,
            ],
            [
                'code' => 'pl',
                'name' => 'Polish',
                'native_name' => 'Polski',
                'flag_emoji' => '🇵🇱',
                'currency_code' => 'PLN',
                'is_default' => false,
                'is_active' => true,
            ],
        ];

        foreach ($locales as $locale) {
            Locale::query()->firstOrCreate(['code' => $locale['code']], $locale);
            // Update currency_code for existing records
            Locale::query()->where('code', $locale['code'])->update(['currency_code' => $locale['currency_code']]);
        }
    }
}
