<?php

declare(strict_types=1);

namespace App\Services\Hooks\Shipping;

use App\Models\ShippingMethod;

final class ShippingCostFilter
{
    public function __construct(
        public int $cost,
        public readonly ShippingMethod $method,
        public readonly float $weightKg,
        public readonly int $subtotal
    ) {}
}
