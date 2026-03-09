<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Attribute;
use Illuminate\Http\Request;

class AttributeIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return Attribute::query()
            ->when($this->request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->when($this->request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($this->request->has('is_filterable'), function ($query) {
                $query->where('is_filterable', $this->request->boolean('is_filterable'));
            })
            ->when($this->request->has('is_variant_selection'), function ($query) {
                $query->where('is_variant_selection', $this->request->boolean('is_variant_selection'));
            })
            ->orderBy('position')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();
    }
}
