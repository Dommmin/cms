<?php

declare(strict_types=1);

namespace App\Filters;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * @implements Filter<Product>
 */
class InStockFilter implements Filter
{
    public function __invoke(Builder $query, mixed $value, string $property): void
    {
        if (filter_var($value, FILTER_VALIDATE_BOOLEAN)) {
            $query->whereHas('activeVariants', fn (Builder $q) => $q->where('stock_quantity', '>', 0));
        }
    }
}
