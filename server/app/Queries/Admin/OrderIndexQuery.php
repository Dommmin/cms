<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return Order::query()
            ->with(['items', 'customer'])
            ->when($this->request->search, function ($query, string $search): void {
                $query->where('order_number', 'like', sprintf('%%%s%%', $search))
                    ->orWhereHas('customer', function ($q) use ($search): void {
                        $q->where('first_name', 'like', sprintf('%%%s%%', $search))
                            ->orWhere('last_name', 'like', sprintf('%%%s%%', $search))
                            ->orWhere('email', 'like', sprintf('%%%s%%', $search));
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
