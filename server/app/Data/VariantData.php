<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;

class VariantData extends Data
{
    public function __construct(
        public ?int $id,
        public string $sku,
        public string $name,
        public int $price,
        public int $cost_price,
        public ?int $compare_at_price,
        public float $weight,
        public int $stock_quantity,
        public int $stock_threshold,
        public bool $is_active,
        public bool $is_default,
        public int $position,
    ) {}
}
