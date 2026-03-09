<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\ShippingMethod;
use Illuminate\Http\Request;

class ShippingMethodIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return ShippingMethod::query()
            ->when($this->request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($this->request->carrier, function ($query, $carrier) {
                $query->where('carrier', $carrier);
            })
            ->when($this->request->has('is_active'), function ($query) {
                $query->where('is_active', $this->request->boolean('is_active'));
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();
    }
}
