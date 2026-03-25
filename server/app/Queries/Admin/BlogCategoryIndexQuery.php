<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\BlogCategory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class BlogCategoryIndexQuery
{
    /**
     * @param  array{search?: mixed, is_active?: mixed, per_page?: mixed}  $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        return BlogCategory::query()
            ->withCount('posts')
            ->with('parent')
            ->when($filters['search'] ?? null, function (Builder $query, mixed $search): void {
                $search = (string) $search;
                $query->where('name', 'like', sprintf('%%%s%%', $search));
            })
            ->when(array_key_exists('is_active', $filters) && $filters['is_active'] !== null && $filters['is_active'] !== '', function (Builder $query) use ($filters): void {
                $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOL));
            })
            ->orderBy('position')
            ->orderBy('name')
            ->paginate((int) ($filters['per_page'] ?? 15))
            ->withQueryString();
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    public function categoriesForSelect(): array
    {
        return BlogCategory::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (BlogCategory $category): array => [
                'id' => $category->id,
                'name' => $category->name,
            ])
            ->toArray();
    }
}
