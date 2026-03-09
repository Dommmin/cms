<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreTaxRateRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateTaxRateRequest;
use App\Models\TaxRate;
use App\Queries\Admin\TaxRateIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class TaxRateController extends Controller
{
    public function index(Request $request): Response
    {
        $taxQuery = new TaxRateIndexQuery($request);
        $taxRates = $taxQuery->execute();

        return inertia('admin/ecommerce/tax-rates/index', [
            'taxRates' => $taxRates,
            'filters' => $request->only(['search', 'is_active', 'is_default']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/ecommerce/tax-rates/create');
    }

    public function store(StoreTaxRateRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $data['is_active'] ?? true;

        if ($data['is_default'] ?? false) {
            TaxRate::where('is_default', true)->update(['is_default' => false]);
        }

        TaxRate::create($data);

        return redirect()->route('admin.ecommerce.tax-rates.index')->with('success', 'Stawka VAT została utworzona');
    }

    public function edit(TaxRate $taxRate): Response
    {
        $taxRate->loadCount(['categories', 'variants']);

        return inertia('admin/ecommerce/tax-rates/edit', [
            'taxRate' => $taxRate,
        ]);
    }

    public function update(UpdateTaxRateRequest $request, TaxRate $taxRate): RedirectResponse
    {
        $data = $request->validated();

        if (($data['is_default'] ?? false) && ! $taxRate->is_default) {
            TaxRate::where('is_default', true)->update(['is_default' => false]);
        }

        $taxRate->update($data);

        return redirect()->back()->with('success', 'Stawka VAT została zaktualizowana');
    }

    public function destroy(TaxRate $taxRate): RedirectResponse
    {
        if ($taxRate->is_default) {
            return redirect()->back()->with('error', 'Nie można usunąć domyślnej stawki VAT');
        }

        if ($taxRate->categories()->exists() || $taxRate->variants()->exists()) {
            return redirect()->back()->with('error', 'Nie można usunąć stawki przypisanej do kategorii lub produktów');
        }

        $taxRate->delete();

        return redirect()->back()->with('success', 'Stawka VAT została usunięta');
    }
}
