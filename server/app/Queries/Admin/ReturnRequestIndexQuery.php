<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\ReturnRequest;
use Illuminate\Database\Eloquent\Builder;
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
            ->when($this->request->filled('search'), function ($query): void {
                $search = (string) $this->request->string('search');

                $query->where(function (Builder $query) use ($search): void {
                    $query->where('reference_number', 'like', sprintf('%%%s%%', $search))
                        ->orWhere('reason', 'like', sprintf('%%%s%%', $search))
                        ->orWhereHas('order', function (Builder $query) use ($search): void {
                            $query->where('reference_number', 'like', sprintf('%%%s%%', $search));
                        })
                        ->orWhereHas('order.customer', function (Builder $query) use ($search): void {
                            $query->where('first_name', 'like', sprintf('%%%s%%', $search))
                                ->orWhere('last_name', 'like', sprintf('%%%s%%', $search))
                                ->orWhere('email', 'like', sprintf('%%%s%%', $search));
                        });
                });
            })
            ->when($this->request->filled('status'), function ($query): void {
                $query->where('status', (string) $this->request->input('status'));
            })
            ->when($this->request->filled('return_type'), function ($query): void {
                $query->where('return_type', (string) $this->request->input('return_type'));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();
    }
}
