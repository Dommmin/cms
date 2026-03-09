<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\ReturnRequest;
use Illuminate\Http\Request;

class ReturnRequestIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return ReturnRequest::query()
            ->with(['order.customer'])
            ->when($this->request->search, function ($query, $search) {
                $query->where('reason', 'like', "%{$search}%")
                    ->orWhereHas('order', function ($q) use ($search) {
                        $q->where('order_number', 'like', "%{$search}%");
                    })
                    ->orWhereHas('order.customer', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($this->request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();
    }
}
