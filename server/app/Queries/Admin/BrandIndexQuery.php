<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Brand;
use Illuminate\Http\Request;

class BrandIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return Brand::query()
            ->when($this->request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($this->request->has('is_active'), function ($query) {
                $query->where('is_active', $this->request->boolean('is_active'));
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();
    }
}
