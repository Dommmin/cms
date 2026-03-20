<?php

declare(strict_types=1);

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * @implements Filter<\App\Models\Product>
 */
class CategoryFilter implements Filter
{
    public function __invoke(Builder $query, mixed $value, string $property): void
    {
        $query->whereHas('category', function (Builder $q) use ($value): void {
            $q->where('is_active', true)
                ->where(function (Builder $q) use ($value): void {
                    // Match the category directly OR via its parent (one level up)
                    $q->where('slug', $value)
                        ->orWhereHas('parent', fn (Builder $q) => $q->where('slug', $value)->where('is_active', true));
                });
        });
    }
}
