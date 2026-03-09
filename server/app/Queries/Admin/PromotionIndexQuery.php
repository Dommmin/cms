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
            ->when($this->request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($this->request->is_active !== null, function ($query, $isActive) {
                $query->where('is_active', $isActive);
            })
            ->when($this->request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->orderBy('priority')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();
    }
}
