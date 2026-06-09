<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\ShippingMethod;
use App\Models\TaxRate;
use App\Models\TaxZoneCountry;
use Illuminate\Support\Collection;

class TaxService
{
    private const array EU_COUNTRIES = [
        'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
        'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
        'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
    ];

    /**
     * Match the correct tax rate for a product variant based on country code.
     */
    public function matchTaxRate(ProductVariant $variant, string $countryCode): TaxRate
    {
        $countryCode = mb_strtoupper($countryCode);

        // 1. Prioritize variant's own effective tax rate if it matches the target country code
        $effectiveRate = $variant->effectiveTaxRate();
        if ($effectiveRate && $effectiveRate->country_code && mb_strtoupper($effectiveRate->country_code) === $countryCode) {
            return $effectiveRate;
        }

        // 2. Find if the country belongs to a TaxZone
        $zoneCountry = TaxZoneCountry::query()
            ->where('country_code', $countryCode)
            ->first();

        if ($zoneCountry) {
            // Check if there is an active TaxRate associated with this TaxZone
            $rate = TaxRate::query()
                ->where('tax_zone_id', $zoneCountry->tax_zone_id)
                ->where('is_active', true)
                ->first();

            if ($rate) {
                return $rate;
            }
        }

        // 3. Check direct country code matching on TaxRate
        $rate = TaxRate::query()
            ->where('country_code', $countryCode)
            ->where('is_active', true)
            ->first();

        if ($rate) {
            return $rate;
        }

        // 4. Fallback to variant's own effective tax rate relation regardless of country code
        if ($effectiveRate instanceof TaxRate) {
            return $effectiveRate;
        }

        // 5. Ultimate fallback to default tax rate
        return TaxRate::default() ?? $this->getFallbackRate();
    }

    /**
     * Determine if tax exemption or reverse charge applies.
     */
    public function determineExemptionStatus(
        string $customerType,
        ?string $vatId,
        string $countryCode,
        bool $isTaxExempt
    ): string {
        $countryCode = mb_strtoupper($countryCode);

        if ($isTaxExempt) {
            return 'exempt';
        }

        // Outside EU is always export/exempt (0% VAT)
        if (! in_array($countryCode, self::EU_COUNTRIES, true)) {
            return 'exempt';
        }

        // B2B Reverse Charge inside EU (excluding PL since PL seller charging PL buyer is standard)
        if ($customerType === 'business' && ! in_array($vatId, [null, '', '0'], true) && $countryCode !== 'PL') {
            return 'reverse_charge';
        }

        return 'standard';
    }

    /**
     * Calculate tax details for a cart/order.
     */
    public function calculateCartTax(
        Collection $items, // Collection of CartItem or OrderItem
        string $countryCode,
        string $customerType,
        ?string $vatId,
        bool $isTaxExempt,
        int $shippingCost,
        ?int $shippingMethodId
    ): array {
        $exemptionStatus = $this->determineExemptionStatus($customerType, $vatId, $countryCode, $isTaxExempt);

        $itemsTax = 0;
        $itemsNet = 0;
        $itemsGross = 0;
        /** @var Collection<int, TaxRate> $itemRates */
        $itemRates = new Collection();

        foreach ($items as $item) {
            $variant = $item->variant;
            $quantity = (int) $item->quantity;

            // Get base price for the item
            $unitPriceGross = $item instanceof CartItem
                ? $item->unitPrice()
                : (int) $item->unit_price;

            $totalPriceGross = $unitPriceGross * $quantity;

            // Get tax rate
            $taxRate = $this->matchTaxRate($variant, $countryCode);

            // Apply exemptions or reverse charge
            $appliedRate = 0;
            $rateName = $taxRate->name;

            if ($exemptionStatus === 'exempt') {
                $appliedRate = 0;
                $rateName = 'EXEMPT (0%)';
            } elseif ($exemptionStatus === 'reverse_charge') {
                $appliedRate = 0;
                $rateName = 'Reverse Charge (0%)';
            } else {
                $appliedRate = (int) $taxRate->rate;
            }

            // Calculate Net & VAT
            // Price is gross, so extract net: net = gross / (1 + rate / 100)
            $netPrice = (int) round($totalPriceGross / (1 + $appliedRate / 100));
            $taxAmount = $totalPriceGross - $netPrice;

            $itemsTax += $taxAmount;
            $itemsNet += $netPrice;
            $itemsGross += $totalPriceGross;

            if ($appliedRate > 0) {
                $itemRates->push($taxRate);
            }
        }

        // Shipping Tax Calculation
        $shippingTax = 0;
        $shippingNet = $shippingCost;
        $shippingRatePercent = 23; // default
        $shippingRateName = 'VAT 23%';

        if ($shippingCost > 0) {
            if ($exemptionStatus === 'exempt') {
                $shippingRatePercent = 0;
                $shippingRateName = 'EXEMPT (0%)';
            } elseif ($exemptionStatus === 'reverse_charge') {
                $shippingRatePercent = 0;
                $shippingRateName = 'Reverse Charge (0%)';
            } else {
                // Determine rate based on settings or shipping method
                $behavior = Setting::get('ecommerce', 'shipping_tax_behavior', 'highest_cart_rate');
                $methodRate = null;

                if ($shippingMethodId) {
                    $method = ShippingMethod::query()->find($shippingMethodId);
                    if ($method && $method->tax_rate_id) {
                        $rate = $method->taxRate;
                        if ($rate instanceof TaxRate) {
                            $methodRate = $rate;
                        }
                    }
                }

                if ($behavior === 'fixed' && $methodRate instanceof TaxRate) {
                    $shippingRatePercent = (int) $methodRate->rate;
                    $shippingRateName = $methodRate->name;
                } elseif ($itemRates->isNotEmpty()) {
                    // Highest cart rate
                    $highestRate = $itemRates->sortByDesc('rate')->first();
                    if ($highestRate instanceof TaxRate) {
                        $shippingRatePercent = (int) $highestRate->rate;
                        $shippingRateName = $highestRate->name;
                    } else {
                        $defaultRate = TaxRate::default() ?? $this->getFallbackRate();
                        $shippingRatePercent = (int) $defaultRate->rate;
                        $shippingRateName = $defaultRate->name;
                    }
                } else {
                    $defaultRate = TaxRate::default() ?? $this->getFallbackRate();
                    $shippingRatePercent = (int) $defaultRate->rate;
                    $shippingRateName = $defaultRate->name;
                }
            }

            $shippingNet = (int) round($shippingCost / (1 + $shippingRatePercent / 100));
            $shippingTax = $shippingCost - $shippingNet;
        }

        $totalTax = $itemsTax + $shippingTax;
        $totalGross = $itemsGross + $shippingCost;
        $totalNet = $itemsNet + $shippingNet;

        return [
            'exemption_status' => $exemptionStatus,
            'items_tax' => $itemsTax,
            'items_net' => $itemsNet,
            'items_gross' => $itemsGross,
            'shipping_tax' => $shippingTax,
            'shipping_net' => $shippingNet,
            'shipping_gross' => $shippingCost,
            'total_tax' => $totalTax,
            'total_net' => $totalNet,
            'total_gross' => $totalGross,
        ];
    }

    private function getFallbackRate(): TaxRate
    {
        $rate = new TaxRate();
        $rate->rate = 23;
        $rate->name = 'VAT 23%';
        $rate->country_code = 'PL';

        return $rate;
    }
}
