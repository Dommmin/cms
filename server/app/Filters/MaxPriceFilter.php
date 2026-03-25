<?php

declare(strict_types=1);

namespace App\Filters;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * @implements Filter<Product>
 */
class MaxPriceFilter implements Filter
{
    public function __invoke(Builder $query, mixed $value, string $property): void
    {
        $priceInCents = (int) round((float) $value * 100);

        $query->whereHas('variants', fn (Builder $q) => $q->where('price', '<=', $priceInCents));
    }
}
