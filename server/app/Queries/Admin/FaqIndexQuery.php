<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Faq;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class FaqIndexQuery
{
    /**
     * @param  array{search?: mixed, category?: mixed, is_active?: mixed, per_page?: mixed}  $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        return Faq::query()
            ->when($filters['search'] ?? null, function (Builder $query, mixed $search): void {
                $search = (string) $search;

                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('question', 'like', sprintf('%%%s%%', $search))
                        ->orWhere('answer', 'like', sprintf('%%%s%%', $search));
                });
            })
            ->when($filters['category'] ?? null, fn (Builder $query, mixed $category): Builder => $query->where('category', (string) $category))
            ->when(array_key_exists('is_active', $filters), function (Builder $query) use ($filters): void {
                $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOL));
            })
            ->orderBy('position')
            ->orderBy('question')
            ->paginate((int) ($filters['per_page'] ?? 20))
            ->withQueryString();
    }

    /**
     * @return array<int, string>
     */
    public function categories(): array
    {
        return Faq::query()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values()
            ->toArray();
    }
}
