<?php

declare(strict_types=1);

namespace App\Services\Hooks\Pricing;

use App\Models\ProductVariant;

final class ProductPriceFilter
{
    public function __construct(
        public int $price,
        public readonly ProductVariant $variant,
        public readonly int $quantity
    ) {}
}
