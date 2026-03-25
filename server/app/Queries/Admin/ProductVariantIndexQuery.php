<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Product;
use App\Models\TaxRate;
use Illuminate\Support\Collection;

final readonly class ProductVariantIndexQuery
{
    public function execute(Product $product): Collection
    {
        return $product->load([
            'variants' => fn ($q) => $q->with(['taxRate', 'attributeValues.attribute', 'attributeValues.attributeValue'])->orderBy('position'),
        ])->variants;
    }

    public function getTaxRates(): Collection
    {
        return TaxRate::query()->where('is_active', true)->get(['id', 'name', 'rate']);
    }
}
