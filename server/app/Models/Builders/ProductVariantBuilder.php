<?php

declare(strict_types=1);

namespace App\Models\Builders;

use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Builder;

/**
 * @template TModelClass of ProductVariant
 *
 * @extends Builder<TModelClass>
 */
class ProductVariantBuilder extends Builder
{
    /**
     * Get the minimum and maximum price bounds (in cents) for variants belonging to active products.
     *
     * @return array{min: int, max: int}
     */
    public function getActivePriceBounds(): array
    {
        /** @var ProductVariant|null $result */
        $result = $this->whereHas('product', fn ($q) => $q->where('is_active', true))
            ->selectRaw('MIN(price) AS min_price, MAX(price) AS max_price')
            ->first();

        return [
            'min' => (int) ($result->min_price ?? 0),
            'max' => (int) ($result->max_price ?? 0),
        ];
    }
}
