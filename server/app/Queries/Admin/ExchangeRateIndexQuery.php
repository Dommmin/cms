<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Currency;
use App\Models\ExchangeRate;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

final readonly class ExchangeRateIndexQuery
{
    public function __construct(private Request $request) {}

    public function execute(): LengthAwarePaginator
    {
        return ExchangeRate::query()
            ->with('currency:id,code,name')
            ->when($this->request->currency_id, function ($query, $currencyId) {
                $query->where('currency_id', $currencyId);
            })
            ->when($this->request->has('source'), function ($query) {
                $query->where('source', $this->request->source);
            })
            ->orderByDesc('fetched_at')
            ->paginate(20)
            ->withQueryString();
    }

    public function getActiveCurrencies(): Collection
    {
        return Currency::where('is_active', true)
            ->where('is_base', false)
            ->get(['id', 'code', 'name']);
    }
}
