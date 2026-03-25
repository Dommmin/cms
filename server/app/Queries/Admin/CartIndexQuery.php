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
            ->when($this->request->search, function ($query, $search): void {
                $query->whereHas('customer', function ($q) use ($search): void {
                    $q->where('email', 'like', sprintf('%%%s%%', $search))
                        ->orWhere('first_name', 'like', sprintf('%%%s%%', $search))
                        ->orWhere('last_name', 'like', sprintf('%%%s%%', $search));
                });
            })
            ->when($this->request->status, function ($query, $status): void {
                $query->where('status', $status);
            })
            ->when($this->request->date_from, function ($query, $date): void {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($this->request->date_to, function ($query, $date): void {
                $query->whereDate('created_at', '<=', $date);
            })->latest()
            ->paginate(25)
            ->withQueryString();
    }
}
