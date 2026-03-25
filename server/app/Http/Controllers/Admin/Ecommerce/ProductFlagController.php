<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreProductFlagRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateProductFlagRequest;
use App\Models\ProductFlag;
use App\Queries\Admin\ProductFlagIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ProductFlagController extends Controller
{
    public function index(Request $request): Response
    {
        $flagQuery = new ProductFlagIndexQuery($request);
        $flags = $flagQuery->execute();

        return inertia('admin/ecommerce/product-flags/index', [
            'flags' => $flags,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/ecommerce/product-flags/create');
    }

    public function store(StoreProductFlagRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] ??= true;

        ProductFlag::query()->create($data);

        return to_route('admin.ecommerce.product-flags.index')
            ->with('success', 'Flaga produktu została utworzona');
    }

    public function show(ProductFlag $productFlag): Response
    {
        $productFlag->load(['products' => function ($query): void {
            $query->select('id', 'name', 'sku', 'price')->orderBy('name');
        }]);

        return inertia('admin/ecommerce/product-flags/show', [
            'flag' => $productFlag,
        ]);
    }

    public function edit(ProductFlag $productFlag): Response
    {
        return inertia('admin/ecommerce/product-flags/edit', [
            'flag' => $productFlag,
        ]);
    }

    public function update(UpdateProductFlagRequest $request, ProductFlag $productFlag): RedirectResponse
    {
        $productFlag->update($request->validated());

        return to_route('admin.ecommerce.product-flags.index')
            ->with('success', 'Flaga produktu została zaktualizowana');
    }

    public function destroy(ProductFlag $productFlag): RedirectResponse
    {
        if ($productFlag->products()->exists()) {
            return back()
                ->with('error', 'Nie można usunąć flagi przypisanej do produktów');
        }

        $productFlag->delete();

        return to_route('admin.ecommerce.product-flags.index')
            ->with('success', 'Flaga produktu została usunięta');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $request->validate([
            'flags' => ['required', 'array'],
            'flags.*.id' => ['required', 'exists:product_flags,id'],
            'flags.*.position' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->flags as $flagData) {
            ProductFlag::query()->where('id', $flagData['id'])
                ->update(['position' => $flagData['position']]);
        }

        return back()
            ->with('success', 'Kolejność flag została zaktualizowana');
    }
}
