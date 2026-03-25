<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStoreRequest;
use App\Http\Requests\Admin\UpdateStoreRequest;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Store::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('city', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('address', 'like', sprintf('%%%s%%', $search));
            });
        }

        $stores = $query->latest()->paginate(20)->withQueryString();

        return inertia('admin/stores/index', [
            'stores' => $stores,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/stores/create');
    }

    public function store(StoreStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        if (! empty($data['opening_hours'])) {
            $decoded = json_decode((string) $data['opening_hours'], true);
            $data['opening_hours'] = $decoded ?? $data['opening_hours'];
        }

        Store::query()->create($data);

        return to_route('admin.stores.index')->with('success', 'Sklep został utworzony');
    }

    public function edit(Store $store): Response
    {
        return inertia('admin/stores/edit', [
            'store' => $store,
        ]);
    }

    public function update(UpdateStoreRequest $request, Store $store): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        if (! empty($data['opening_hours'])) {
            $decoded = json_decode((string) $data['opening_hours'], true);
            $data['opening_hours'] = $decoded ?? $data['opening_hours'];
        }

        $store->update($data);

        return back()->with('success', 'Sklep został zaktualizowany');
    }

    public function destroy(Store $store): RedirectResponse
    {
        $store->delete();

        return back()->with('success', 'Sklep został usunięty');
    }

    public function toggleActive(Store $store): RedirectResponse
    {
        $store->update(['is_active' => ! $store->is_active]);

        $message = $store->is_active ? 'Sklep został aktywowany' : 'Sklep został dezaktywowany';

        return back()->with('success', $message);
    }
}
