<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Enums\ShippingCarrierEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreShippingMethodRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateShippingMethodRequest;
use App\Models\ShippingMethod;
use App\Queries\Admin\ShippingMethodIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ShippingMethodController extends Controller
{
    public function index(Request $request): Response
    {
        $shippingQuery = new ShippingMethodIndexQuery($request);
        $methods = $shippingQuery->execute();

        return inertia('admin/ecommerce/shipping-methods/index', [
            'methods' => $methods,
            'filters' => $request->only(['search', 'carrier', 'is_active']),
            'carriers' => array_map(fn (ShippingCarrierEnum $c): array => ['value' => $c->value, 'label' => $c->getLabel()], ShippingCarrierEnum::cases()),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/ecommerce/shipping-methods/create', [
            'carriers' => array_map(fn (ShippingCarrierEnum $c): array => ['value' => $c->value, 'label' => $c->getLabel()], ShippingCarrierEnum::cases()),
        ]);
    }

    public function store(StoreShippingMethodRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] ??= true;

        ShippingMethod::query()->create($data);

        return to_route('admin.ecommerce.shipping-methods.index')->with('success', 'Metoda dostawy została utworzona');
    }

    public function edit(ShippingMethod $shippingMethod): Response
    {
        $shippingMethod->loadCount('shipments');

        return inertia('admin/ecommerce/shipping-methods/edit', [
            'method' => $shippingMethod,
            'carriers' => array_map(fn (ShippingCarrierEnum $c): array => ['value' => $c->value, 'label' => $c->getLabel()], ShippingCarrierEnum::cases()),
        ]);
    }

    public function update(UpdateShippingMethodRequest $request, ShippingMethod $shippingMethod): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] ??= true;

        $shippingMethod->update($data);

        return back()->with('success', 'Metoda dostawy została zaktualizowana');
    }

    public function destroy(ShippingMethod $shippingMethod): RedirectResponse
    {
        if ($shippingMethod->shipments()->exists()) {
            return back()->with('error', 'Nie można usunąć metody użytej w przesyłkach');
        }

        $shippingMethod->delete();

        return back()->with('success', 'Metoda dostawy została usunięta');
    }

    public function toggleActive(ShippingMethod $shippingMethod): RedirectResponse
    {
        $shippingMethod->update(['is_active' => ! $shippingMethod->is_active]);

        $message = $shippingMethod->is_active ? 'Metoda dostawy została aktywowana' : 'Metoda dostawy została dezaktywowana';

        return back()->with('success', $message);
    }
}
