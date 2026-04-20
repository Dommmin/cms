<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Enums\ShippingCarrierEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreShippingMethodRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateShippingMethodRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Queries\Admin\ShippingMethodIndexQuery;
use Illuminate\Http\JsonResponse;
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
            'restrictions' => [
                'products' => $shippingMethod->restrictedProducts()->select('products.id', 'products.name')->get()
                    ->map(/** @phpstan-ignore argument.type */ fn (Product $p): array => ['id' => $p->id, 'name' => $p->getTranslation('name', app()->getLocale(), false) ?: $p->name]),
                'categories' => $shippingMethod->restrictedCategories()->select('categories.id', 'categories.name')->get()
                    ->map(/** @phpstan-ignore argument.type */ fn (Category $c): array => ['id' => $c->id, 'name' => $c->getTranslation('name', app()->getLocale(), false) ?: $c->name]),
            ],
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

    public function addRestriction(Request $request, ShippingMethod $shippingMethod): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:product,category'],
            'id' => ['required', 'integer', 'min:1'],
        ]);

        $type = $validated['type'];
        $id = (int) $validated['id'];

        if ($type === 'product') {
            $exists = Product::query()->where('id', $id)->exists();
            abort_unless($exists, 404, 'Product not found');
            $name = Product::query()->find($id)?->getTranslation('name', app()->getLocale(), false);
        } else {
            $exists = Category::query()->where('id', $id)->exists();
            abort_unless($exists, 404, 'Category not found');
            $name = Category::query()->find($id)?->getTranslation('name', app()->getLocale(), false);
        }

        $shippingMethod->getConnection()
            ->table('shipping_method_restrictions')
            ->insertOrIgnore([
                'shipping_method_id' => $shippingMethod->id,
                'restrictable_type' => $type,
                'restrictable_id' => $id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        return response()->json(['id' => $id, 'name' => $name, 'type' => $type]);
    }

    public function removeRestriction(Request $request, ShippingMethod $shippingMethod): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:product,category'],
            'id' => ['required', 'integer', 'min:1'],
        ]);

        $shippingMethod->getConnection()
            ->table('shipping_method_restrictions')
            ->where('shipping_method_id', $shippingMethod->id)
            ->where('restrictable_type', $validated['type'])
            ->where('restrictable_id', (int) $validated['id'])
            ->delete();

        return response()->json(['removed' => true]);
    }

    public function searchRestrictable(Request $request): JsonResponse
    {
        $q = mb_trim($request->string('q')->value());
        $type = $request->string('type')->value();

        if (mb_strlen($q) < 1) {
            return response()->json([]);
        }

        $like = sprintf('%%%s%%', $q);

        if ($type === 'category') {
            $results = Category::query()
                ->where('name', 'LIKE', $like)
                ->orderBy('name')
                ->limit(10)
                ->get(['id', 'name'])
                ->map(/** @phpstan-ignore argument.type */ fn (Category $c): array => [
                    'id' => $c->id,
                    'name' => $c->getTranslation('name', app()->getLocale(), false) ?: (is_array($c->getRawOriginal('name')) ? reset($c->getRawOriginal('name')) : $c->getRawOriginal('name')),
                ]);
        } else {
            $results = Product::query()
                ->where('name', 'LIKE', $like)
                ->orderBy('name')
                ->limit(10)
                ->get(['id', 'name'])
                ->map(/** @phpstan-ignore argument.type */ fn (Product $p): array => [
                    'id' => $p->id,
                    'name' => $p->getTranslation('name', app()->getLocale(), false) ?: (is_array($p->getRawOriginal('name')) ? reset($p->getRawOriginal('name')) : $p->getRawOriginal('name')),
                ]);
        }

        return response()->json($results);
    }
}
