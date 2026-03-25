<?php

declare(strict_types=1);

namespace App\Sorts;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Sorts\Sort;

/**
 * @implements Sort<Product>
 */
class VariantPriceSort implements Sort
{
    public function __invoke(Builder $query, bool $descending, string $property): void
    {
        $direction = $descending ? 'desc' : 'asc';

        $query->orderBy(
            fn ($q) => $q->selectRaw('MIN(price)')
                ->from('product_variants')
                ->whereColumn('product_variants.product_id', 'products.id'),
            $direction
        );
    }
}
