<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreFlashSaleRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateFlashSaleRequest;
use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class FlashSaleController extends Controller
{
    public function index(Request $request): Response
    {
        $flashSales = FlashSale::query()
            ->with(['product:id,name', 'variant:id,product_id,sku'])
            ->when($request->input('search'), function ($query, string $search): void {
                $query->where('name', 'like', sprintf('%%%s%%', $search))
                    ->orWhereHas('product', fn ($q) => $q->where('name->'.app()->getLocale(), 'like', sprintf('%%%s%%', $search)));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return inertia('admin/ecommerce/flash-sales/index', [
            'flashSales' => $flashSales,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('name->'.app()->getLocale())
            ->get(['id', 'name']);

        return inertia('admin/ecommerce/flash-sales/create', [
            'products' => $products,
        ]);
    }

    public function store(StoreFlashSaleRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] ??= true;

        // Convert decimal PLN to cents if frontend sends decimal
        FlashSale::query()->create($data);

        return to_route('admin.ecommerce.flash-sales.index')->with('success', 'Flash sale został utworzony');
    }

    public function edit(FlashSale $flashSale): Response
    {
        $flashSale->load(['product:id,name', 'variant:id,product_id,sku']);

        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('name->'.app()->getLocale())
            ->get(['id', 'name']);

        return inertia('admin/ecommerce/flash-sales/edit', [
            'flashSale' => $flashSale,
            'products' => $products,
        ]);
    }

    public function update(UpdateFlashSaleRequest $request, FlashSale $flashSale): RedirectResponse
    {
        $data = $request->validated();
        $flashSale->update($data);

        return back()->with('success', 'Flash sale został zaktualizowany');
    }

    public function destroy(FlashSale $flashSale): RedirectResponse
    {
        $flashSale->delete();

        return back()->with('success', 'Flash sale został usunięty');
    }
}
