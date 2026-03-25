<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\ProductFlag;
use Illuminate\Http\Request;

class ProductFlagIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return ProductFlag::query()
            ->when($this->request->search, function ($query, $search): void {
                $query->where('name', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('description', 'like', sprintf('%%%s%%', $search));
            })
            ->when($this->request->has('is_active'), function ($query): void {
                $query->where('is_active', $this->request->boolean('is_active'));
            })
            ->orderBy('position')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();
    }
}
