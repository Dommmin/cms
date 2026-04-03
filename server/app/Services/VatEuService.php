<?php

declare(strict_types=1);

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;

class VatEuService
{
    public function calculateVat(int $amountCents, string $countryCode, string $customerType = 'consumer', ?string $vatId = null): int
    {
        // Poland base currency - VAT already included
        if ($countryCode === 'PL') {
            $rate = config('cart.vat_rate', 23);

            return (int) round($amountCents * $rate / 100);
        }

        // B2B with valid VAT ID - VAT exempt (reverse charge)
        if ($customerType === 'business' && $vatId && $this->validateVatId($countryCode, $vatId)) {
            return 0;
        }

        // EU consumer - use destination country VAT rate (OSS)
        $vatRates = $this->getEuVatRates();
        $rate = $vatRates[$countryCode] ?? 0;

        return (int) round($amountCents * $rate / 100);
    }

    public function getEuVatRates(): array
    {
        return [
            'AT' => 20, 'BE' => 21, 'BG' => 20, 'CY' => 19, 'CZ' => 21,
            'DE' => 19, 'DK' => 25, 'EE' => 20, 'ES' => 21, 'FI' => 24,
            'FR' => 20, 'GR' => 24, 'HR' => 25, 'HU' => 27, 'IE' => 23,
            'IT' => 22, 'LT' => 21, 'LU' => 17, 'LV' => 21, 'MT' => 18,
            'NL' => 21, 'PT' => 23, 'RO' => 19, 'SE' => 25, 'SI' => 22,
            'SK' => 20, 'PL' => 23,
        ];
    }

    public function validateVatId(string $countryCode, string $vatId): bool
    {
        try {
            $response = Http::get('https://ec.europa.eu/taxation_customs/vies/services/checkVatService', [
                'countryCode' => $countryCode,
                'vatNumber' => $vatId,
            ]);

            return $response->successful() && str_contains($response->body(), 'valid="true"');
        } catch (Exception) {
            return false;
        }
    }

    public function isEuCountry(string $countryCode): bool
    {
        return in_array($countryCode, array_keys($this->getEuVatRates()), true);
    }
}
