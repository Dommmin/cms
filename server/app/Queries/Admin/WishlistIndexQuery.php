<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return Wishlist::query()
            ->with(['customer', 'product'])
            ->when($this->request->search, function ($query, $search) {
                $query->whereHas('customer', function ($q) use ($search) {
                    $q->where('email', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                })
                    ->orWhereHas('product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    });
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
