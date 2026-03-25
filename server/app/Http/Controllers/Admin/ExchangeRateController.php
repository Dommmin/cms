<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExchangeRateRequest;
use App\Http\Requests\Admin\UpdateExchangeRateRequest;
use App\Models\ExchangeRate;
use App\Queries\Admin\ExchangeRateIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ExchangeRateController extends Controller
{
    public function index(Request $request): Response
    {
        $query = new ExchangeRateIndexQuery($request);
        $rates = $query->execute();
        $currencies = $query->getActiveCurrencies();

        return inertia('admin/exchange-rates/index', [
            'rates' => $rates,
            'currencies' => $currencies,
            'filters' => $request->only(['currency_id', 'source']),
        ]);
    }

    public function create(): Response
    {
        $currencies = new ExchangeRateIndexQuery(request())->getActiveCurrencies();

        return inertia('admin/exchange-rates/create', [
            'currencies' => $currencies,
        ]);
    }

    public function store(StoreExchangeRateRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['fetched_at'] ??= now();

        ExchangeRate::query()->create($data);

        return to_route('admin.exchange-rates.index')->with('success', 'Kurs wymiany został dodany');
    }

    public function edit(ExchangeRate $exchangeRate): Response
    {
        $exchangeRate->load('currency');
        $currencies = new ExchangeRateIndexQuery(request())->getActiveCurrencies();

        return inertia('admin/exchange-rates/edit', [
            'rate' => $exchangeRate,
            'currencies' => $currencies,
        ]);
    }

    public function update(UpdateExchangeRateRequest $request, ExchangeRate $exchangeRate): RedirectResponse
    {
        $data = $request->validated();

        $exchangeRate->update($data);

        return back()->with('success', 'Kurs wymiany został zaktualizowany');
    }

    public function destroy(ExchangeRate $exchangeRate): RedirectResponse
    {
        $exchangeRate->delete();

        return back()->with('success', 'Kurs wymiany został usunięty');
    }
}
