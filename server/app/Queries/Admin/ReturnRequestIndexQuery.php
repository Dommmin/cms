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
            ->when($this->request->search, function ($query, string $search): void {
                $query->where('reason', 'like', sprintf('%%%s%%', $search))
                    ->orWhereHas('order', function ($q) use ($search): void {
                        $q->where('order_number', 'like', sprintf('%%%s%%', $search));
                    })
                    ->orWhereHas('order.customer', function ($q) use ($search): void {
                        $q->where('first_name', 'like', sprintf('%%%s%%', $search))
                            ->orWhere('last_name', 'like', sprintf('%%%s%%', $search))
                            ->orWhere('email', 'like', sprintf('%%%s%%', $search));
                    });
            })
            ->when($this->request->status, function ($query, $status): void {
                $query->where('status', $status);
            })->latest()
            ->paginate(20)
            ->withQueryString();
    }
}
