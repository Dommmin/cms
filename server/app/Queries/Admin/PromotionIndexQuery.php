<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return Promotion::query()
            ->with(['products', 'categories'])
            ->when($this->request->search, function ($query, $search): void {
                $query->where('name', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('description', 'like', sprintf('%%%s%%', $search));
            })
            ->when($this->request->is_active !== null, function ($query, $isActive): void {
                $query->where('is_active', $isActive);
            })
            ->when($this->request->type, function ($query, $type): void {
                $query->where('type', $type);
            })
            ->orderBy('priority')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();
    }
}
