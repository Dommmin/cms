<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\User;
use Illuminate\Http\Request;

class UserIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return User::query()
            ->when($this->request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($this->request->role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->when($this->request->has('is_active'), function ($query) {
                $query->where('is_active', $this->request->boolean('is_active'));
            })
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();
    }
}
