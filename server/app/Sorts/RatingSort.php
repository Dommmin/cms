<?php

declare(strict_types=1);

namespace App\Sorts;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Sorts\Sort;

/**
 * @implements Sort<Product>
 */
class RatingSort implements Sort
{
    public function __invoke(Builder $query, bool $descending, string $property): void
    {
        $direction = $descending ? 'desc' : 'asc';

        $query->orderBy(
            fn ($q) => $q->selectRaw('COALESCE(AVG(rating), 0)')
                ->from('product_reviews')
                ->whereColumn('product_reviews.product_id', 'products.id')
                ->where('product_reviews.status', 'approved'),
            $direction
        );
    }
}
