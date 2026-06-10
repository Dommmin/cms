<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ViesService
{
    /**
     * Validate EU VAT number via VIES API.
     * Returns:
     * - true: if VAT is valid
     * - false: if VAT is invalid
     * - null: if the API call failed (timeout/error), signaling to fallback to local check
     */
    public function validateVat(string $countryCode, string $vatNumber): ?bool
    {
        $countryCode = mb_strtoupper($countryCode);
        $vatNumber = preg_replace('/[^A-Za-z0-9]/', '', $vatNumber) ?? '';

        try {
            $response = Http::timeout(3)
                ->get(sprintf('https://ec.europa.eu/taxation_customs/vies/rest-api/ms/%s/vat/%s', $countryCode, $vatNumber));

            if ($response->failed()) {
                Log::warning('VIES validation API call failed with status '.$response->status(), [
                    'country' => $countryCode,
                    'vat_number' => $vatNumber,
                ]);

                return null;
            }

            $data = $response->json();

            if (! is_array($data) || ! isset($data['isValid'])) {
                Log::warning('VIES response missing isValid field', [
                    'country' => $countryCode,
                    'vat_number' => $vatNumber,
                    'response' => $data,
                ]);

                return null;
            }

            return (bool) $data['isValid'];
        } catch (Throwable $throwable) {
            Log::warning('VIES API request exception: '.$throwable->getMessage(), [
                'country' => $countryCode,
                'vat_number' => $vatNumber,
            ]);

            return null;
        }
    }
}
