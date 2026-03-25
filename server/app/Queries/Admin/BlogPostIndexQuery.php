<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Enums\BlogPostStatusEnum;
use App\Models\BlogPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class BlogPostIndexQuery
{
    /**
     * @param  array{search?: mixed, category_id?: mixed, status?: mixed, content_type?: mixed, per_page?: mixed}  $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        return BlogPost::query()
            ->with(['author', 'category'])
            ->when($filters['search'] ?? null, function (Builder $query, mixed $search): void {
                $search = (string) $search;

                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('title', 'like', sprintf('%%%s%%', $search))
                        ->orWhere('excerpt', 'like', sprintf('%%%s%%', $search));
                });
            })
            ->when($filters['category_id'] ?? null, fn (Builder $query, mixed $categoryId): Builder => $query->where('blog_category_id', (int) $categoryId))
            ->when($filters['status'] ?? null, fn (Builder $query, mixed $status): Builder => $query->where('status', (string) $status))
            ->when($filters['content_type'] ?? null, fn (Builder $query, mixed $contentType): Builder => $query->where('content_type', (string) $contentType))->latest()
            ->paginate((int) ($filters['per_page'] ?? 15))
            ->withQueryString();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public function statuses(): array
    {
        return array_map(
            fn (BlogPostStatusEnum $status): array => [
                'value' => $status->value,
                'label' => $status->getLabel(),
            ],
            BlogPostStatusEnum::cases()
        );
    }
}
