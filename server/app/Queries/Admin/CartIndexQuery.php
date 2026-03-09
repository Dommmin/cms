<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Cart;
use Illuminate\Http\Request;

class CartIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return Cart::query()
            ->with(['customer', 'items.product'])
            ->when($this->request->search, function ($query, $search) {
                $query->whereHas('customer', function ($q) use ($search) {
                    $q->where('email', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->when($this->request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($this->request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($this->request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();
    }
}
