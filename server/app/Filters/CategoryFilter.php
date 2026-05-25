<?php

declare(strict_types=1);

namespace App\Filters;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * @implements Filter<Product>
 */
class CategoryFilter implements Filter
{
    public function __invoke(Builder $query, mixed $value, string $property): void
    {
        $locale = app()->getLocale();

        $query->whereHas('category', function (Builder $q) use ($value, $locale): void {
            $q->where('is_active', true)
                ->where(function (Builder $q) use ($value, $locale): void {
                    // Match the category directly OR via its parent (one level up)
                    $q->where('slug->'.$locale, $value)
                        ->orWhereHas('parent', fn (Builder $q) => $q->where('slug->'.$locale, $value)->where('is_active', true));
                });
        });
    }
}
