<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\TaxRate;
use Illuminate\Http\Request;

class TaxRateIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return TaxRate::query()
            ->when($this->request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($this->request->has('is_active'), function ($query) {
                $query->where('is_active', $this->request->boolean('is_active'));
            })
            ->when($this->request->has('is_default'), function ($query) {
                $query->where('is_default', $this->request->boolean('is_default'));
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();
    }
}
