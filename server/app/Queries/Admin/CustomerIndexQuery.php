<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return Customer::query()
            ->when($this->request->search, function ($query, $search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($this->request->has('is_active'), function ($query) {
                $query->where('is_active', $this->request->boolean('is_active'));
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(25)
            ->withQueryString();
    }
}
