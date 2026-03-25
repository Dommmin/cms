<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\ProductType;
use Illuminate\Http\Request;

class ProductTypeIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return ProductType::query()
            ->when($this->request->search, function ($query, $search): void {
                $query->where('name', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('description', 'like', sprintf('%%%s%%', $search));
            })
            ->when($this->request->has('has_variants'), function ($query): void {
                $query->where('has_variants', $this->request->boolean('has_variants'));
            })
            ->when($this->request->has('is_shippable'), function ($query): void {
                $query->where('is_shippable', $this->request->boolean('is_shippable'));
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();
    }
}
