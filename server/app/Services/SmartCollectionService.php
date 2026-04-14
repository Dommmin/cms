<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class SmartCollectionService
{
    public function buildQuery(Category $category): Builder
    {
        $rules = $category->rules ?? [];
        $match = $category->rules_match ?? 'all';

        $query = Product::query()->where('is_active', true);

        if (empty($rules)) {
            return $query->whereRaw('1 = 0');
        }

        if ($match === 'all') {
            foreach ($rules as $rule) {
                $this->applyRule($query, $rule);
            }
        } else {
            $query->where(function (Builder $q) use ($rules): void {
                foreach ($rules as $rule) {
                    $q->orWhere(function (Builder $inner) use ($rule): void {
                        $this->applyRule($inner, $rule);
                    });
                }
            });
        }

        return $query;
    }

    /** @return Collection<int, Product> */
    public function getMatchingProducts(Category $category): Collection
    {
        return $this->buildQuery($category)->get();
    }

    public function countMatchingProducts(Category $category): int
    {
        return $this->buildQuery($category)->count();
    }

    /** @param  array<string, mixed>  $rule */
    private function applyRule(Builder $q, array $rule): void
    {
        $field = (string) ($rule['field'] ?? '');
        $condition = (string) ($rule['condition'] ?? '');
        $value = $rule['value'] ?? null;

        match ($field) {
            'price' => match ($condition) {
                'less_than' => $q->whereHas('variants', fn (Builder $vq) => $vq->where('price', '<', (int) $value)),
                'greater_than' => $q->whereHas('variants', fn (Builder $vq) => $vq->where('price', '>', (int) $value)),
                default => null,
            },
            'brand_id' => match ($condition) {
                'equals' => $q->where('brand_id', (int) $value),
                'not_equals' => $q->where('brand_id', '!=', (int) $value),
                default => null,
            },
            'product_type_id' => match ($condition) {
                'equals' => $q->where('product_type_id', (int) $value),
                'not_equals' => $q->where('product_type_id', '!=', (int) $value),
                default => null,
            },
            'tag' => match ($condition) {
                'equals' => $q->whereHas('tags', fn (Builder $tq) => $tq->where('name', $value)),
                'not_equals' => $q->whereDoesntHave('tags', fn (Builder $tq) => $tq->where('name', $value)),
                default => null,
            },
            'is_active' => $q->where('is_active', filter_var($value, FILTER_VALIDATE_BOOLEAN)),
            'created_at' => match ($condition) {
                'after' => $q->where('created_at', '>=', $value),
                'before' => $q->where('created_at', '<=', $value),
                default => null,
            },
            default => null,
        };
    }
}
