<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCurrencyRequest;
use App\Http\Requests\Admin\UpdateCurrencyRequest;
use App\Models\Currency;
use App\Queries\Admin\CurrencyIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function index(Request $request): Response
    {
        $currencies = (new CurrencyIndexQuery($request))->execute();

        return inertia('admin/currencies/index', [
            'currencies' => $currencies,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/currencies/create');
    }

    public function store(StoreCurrencyRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['is_active'] = $data['is_active'] ?? true;

        if ($data['is_base'] ?? false) {
            Currency::where('is_base', true)->update(['is_base' => false]);
        }

        Currency::create($data);

        return redirect()->route('admin.currencies.index')->with('success', 'Waluta została utworzona');
    }

    public function edit(Currency $currency): Response
    {
        $currency->load(['exchangeRates' => fn ($q) => $q->latest('fetched_at')->limit(5)]);

        return inertia('admin/currencies/edit', [
            'currency' => $currency,
        ]);
    }

    public function update(UpdateCurrencyRequest $request, Currency $currency): RedirectResponse
    {
        $data = $request->validated();

        if (($data['is_base'] ?? false) && ! $currency->is_base) {
            Currency::where('is_base', true)->update(['is_base' => false]);
        }

        // Zapobiegamy usunięciu is_base gdyby to była ostatnia waluta
        if (! ($data['is_base'] ?? false) && $currency->is_base) {
            $baseCount = Currency::where('is_base', true)->count();
            if ($baseCount <= 1) {
                unset($data['is_base']);
            }
        }

        $currency->update($data);

        return redirect()->back()->with('success', 'Waluta została zaktualizowana');
    }

    public function destroy(Currency $currency): RedirectResponse
    {
        if ($currency->is_base) {
            return redirect()->back()->with('error', 'Nie można usunąć waluty bazowej');
        }

        DB::transaction(function () use ($currency) {
            $currency->exchangeRates()->delete();
            $currency->delete();
        });

        return redirect()->back()->with('success', 'Waluta została usunięta');
    }
}
