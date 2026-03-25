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
            ->when($this->request->search, function ($query, $search): void {
                $query->whereHas('customer', function ($q) use ($search): void {
                    $q->where('email', 'like', sprintf('%%%s%%', $search))
                        ->orWhere('first_name', 'like', sprintf('%%%s%%', $search))
                        ->orWhere('last_name', 'like', sprintf('%%%s%%', $search));
                })
                    ->orWhereHas('product', function ($q) use ($search): void {
                        $q->where('name', 'like', sprintf('%%%s%%', $search))
                            ->orWhere('sku', 'like', sprintf('%%%s%%', $search));
                    });
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
