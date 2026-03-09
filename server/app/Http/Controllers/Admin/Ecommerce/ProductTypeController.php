<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreProductTypeRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateProductTypeRequest;
use App\Models\ProductType;
use App\Queries\Admin\ProductTypeIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ProductTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $typeQuery = new ProductTypeIndexQuery($request);
        $types = $typeQuery->execute();

        return inertia('admin/ecommerce/product-types/index', [
            'types' => $types,
            'filters' => $request->only(['search', 'has_variants', 'is_shippable']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/ecommerce/product-types/create');
    }

    public function store(StoreProductTypeRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['has_variants'] = $data['has_variants'] ?? false;
        $data['is_shippable'] = $data['is_shippable'] ?? true;

        ProductType::create($data);

        return redirect()->route('admin.ecommerce.product-types.index')->with('success', 'Typ produktu został utworzony');
    }

    public function edit(ProductType $productType): Response
    {
        $productType->load(['attributes']);

        return inertia('admin/ecommerce/product-types/edit', [
            'productType' => $productType,
        ]);
    }

    public function update(UpdateProductTypeRequest $request, ProductType $productType): RedirectResponse
    {
        $data = $request->validated();

        $productType->update($data);

        return redirect()->back()->with('success', 'Typ produktu został zaktualizowany');
    }

    public function destroy(ProductType $productType): RedirectResponse
    {
        if ($productType->products()->exists()) {
            return redirect()->back()->with('error', 'Nie można usunąć typu przypisanego do produktów');
        }

        $productType->delete();

        return redirect()->back()->with('success', 'Typ produktu został usunięty');
    }
}
