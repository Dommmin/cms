<?php

declare(strict_types=1);

namespace App\Rules;

use App\Services\ViesService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class VatId implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string):PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail(__('validation.vat_id.must_be_string', [], 'The VAT/NIP number must be a string.'));

            return;
        }

        // Clean the input (remove spaces, hyphens, etc.)
        $clean = preg_replace('/[^A-Za-z0-9]/', '', $value);

        if (empty($clean)) {
            $fail(__('validation.vat_id.empty', [], 'The VAT/NIP number cannot be empty.'));

            return;
        }

        // Check if it's a Polish NIP (either 10 digits or PL + 10 digits)
        if (preg_match('/^(PL)?\d{10}$/i', $clean)) {
            $nip = preg_replace('/^PL/i', '', $clean);
            if (! $this->validatePolishNip($nip)) {
                $fail(__('validation.vat_id.invalid_nip', [], 'The provided NIP number is invalid.'));
            }

            return;
        }

        // For EU VAT, check prefix + format
        if (preg_match('/^([A-Z]{2})([A-Z0-9]{2,12})$/i', $clean, $matches)) {
            $countryPrefix = mb_strtoupper($matches[1]);
            $vatNumber = $matches[2];

            // List of EU country codes (excluding PL which we handled above)
            $euCountries = [
                'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
                'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
                'NL', 'PT', 'RO', 'SE', 'SI', 'SK',
            ];

            if (! in_array($countryPrefix, $euCountries, true)) {
                $fail(__('validation.vat_id.invalid_country_prefix', [], 'Invalid country prefix for EU VAT number.'));

                return;
            }

            $viesService = resolve(ViesService::class);
            $isValid = $viesService->validateVat($countryPrefix, $vatNumber);

            if ($isValid === false) {
                $fail(__('validation.vat_id.inactive_vat', [], 'The provided EU VAT number is inactive or invalid in the VIES database.'));
            }

            return;
        }

        $fail(__('validation.vat_id.invalid_format', [], 'Invalid NIP or EU VAT number format.'));
    }

    private function validatePolishNip(string $nip): bool
    {
        if (mb_strlen($nip) !== 10) {
            return false;
        }

        $weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
        $sum = 0;

        for ($i = 0; $i < 9; $i++) {
            $sum += (int) $nip[$i] * $weights[$i];
        }

        return ($sum % 11) === (int) $nip[9];
    }
}
