<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Currency;
use App\Models\ExchangeRate;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        // PLN — base currency (all prices stored in PLN cents)
        $pln = Currency::firstOrCreate(['code' => 'PLN'], [
            'name' => 'Polish Złoty',
            'symbol' => 'zł',
            'decimal_places' => 2,
            'is_active' => true,
            'is_base' => true,
        ]);

        // USD
        $usd = Currency::firstOrCreate(['code' => 'USD'], [
            'name' => 'US Dollar',
            'symbol' => '$',
            'decimal_places' => 2,
            'is_active' => true,
            'is_base' => false,
        ]);

        // EUR
        $eur = Currency::firstOrCreate(['code' => 'EUR'], [
            'name' => 'Euro',
            'symbol' => '€',
            'decimal_places' => 2,
            'is_active' => true,
            'is_base' => false,
        ]);

        // Seed exchange rates (1 PLN = X target currency)
        // These are approximate rates — admin can update via the exchange rates panel
        $rates = [
            ['currency' => $usd, 'rate' => 0.25],   // 1 PLN ≈ 0.25 USD
            ['currency' => $eur, 'rate' => 0.23],   // 1 PLN ≈ 0.23 EUR
        ];

        foreach ($rates as $item) {
            $existing = ExchangeRate::where('currency_id', $item['currency']->id)
                ->latest('fetched_at')
                ->first();

            if (! $existing) {
                ExchangeRate::create([
                    'currency_id' => $item['currency']->id,
                    'rate' => $item['rate'],
                    'source' => 'manual',
                    'fetched_at' => now(),
                ]);
            }
        }
    }
}
