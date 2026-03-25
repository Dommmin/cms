<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        $perPage = min(max($this->request->integer('per_page', 20), 1), 100);

        return Category::query()
            ->when($this->request->search, function ($query, $search): void {
                $query->where('name', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('description', 'like', sprintf('%%%s%%', $search));
            })
            ->when($this->request->parent_id, function ($query, $parentId): void {
                $query->where('parent_id', $parentId);
            })
            ->when($this->request->has('is_active'), function ($query): void {
                $query->where('is_active', $this->request->boolean('is_active'));
            })
            ->with('parent')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getAllCategories()
    {
        return Category::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);
    }

    public function getCategoriesForParentSelection(?int $excludeId = null)
    {
        return Category::query()
            ->when($excludeId, fn ($query) => $query->where('id', '!=', $excludeId))
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->values();
    }
}
