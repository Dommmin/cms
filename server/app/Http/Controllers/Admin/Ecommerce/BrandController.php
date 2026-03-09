<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreBrandRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateBrandRequest;
use App\Models\Brand;
use App\Queries\Admin\BrandIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(Request $request): Response
    {
        $brandQuery = new BrandIndexQuery($request);
        $brands = $brandQuery->execute();

        return inertia('admin/ecommerce/brands/index', [
            'brands' => $brands,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/ecommerce/brands/create');
    }

    public function store(StoreBrandRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $data['is_active'] ?? true;
        $data['position'] = $data['position'] ?? 0;

        Brand::create($data);

        return redirect()->route('admin.ecommerce.brands.index')->with('success', 'Marka została utworzona');
    }

    public function edit(Brand $brand): Response
    {
        $brand->loadCount('products');

        return inertia('admin/ecommerce/brands/edit', [
            'brand' => $brand,
        ]);
    }

    public function update(UpdateBrandRequest $request, Brand $brand): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $data['is_active'] ?? true;

        $brand->update($data);

        return redirect()->back()->with('success', 'Marka została zaktualizowana');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        if ($brand->products()->exists()) {
            return redirect()->back()->with('error', 'Nie można usunąć marki przypisanej do produktów');
        }

        $brand->delete();

        return redirect()->back()->with('success', 'Marka została usunięta');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);

        $brandsWithProducts = Brand::whereIn('id', $ids)
            ->whereHas('products')
            ->count();

        if ($brandsWithProducts > 0) {
            return redirect()->back()->with('error', 'Niektóre marki są przypisane do produktów i nie mogą zostać usunięte');
        }

        Brand::whereIn('id', $ids)->delete();

        return redirect()->back()->with('success', 'Zaznaczone marki zostały usunięte');
    }
}
