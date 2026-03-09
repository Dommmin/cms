<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

final readonly class CurrencyIndexQuery
{
    public function __construct(private Request $request) {}

    public function execute(): LengthAwarePaginator
    {
        return Currency::query()
            ->with(['exchangeRates' => fn ($q) => $q->latest('fetched_at')->limit(1)])
            ->when($this->request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->when($this->request->has('is_active'), function ($query) {
                $query->where('is_active', $this->request->boolean('is_active'));
            })
            ->orderByDesc('is_base')
            ->orderBy('code')
            ->paginate(20)
            ->withQueryString();
    }
}
