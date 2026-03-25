<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMenuRequest;
use App\Http\Requests\Admin\UpdateMenuRequest;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Queries\Admin\MenuIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(Request $request): Response
    {
        $query = new MenuIndexQuery($request);
        $menus = $query->execute();
        $locations = $query->getLocations();

        return inertia('admin/menus/index', [
            'menus' => $menus,
            'filters' => $request->only(['search', 'location', 'is_active']),
            'locations' => $locations,
        ]);
    }

    public function create(): Response
    {
        $locations = new MenuIndexQuery(request())->getLocations();

        return inertia('admin/menus/create', [
            'locations' => $locations,
        ]);
    }

    public function store(StoreMenuRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['is_active'] ??= true;

        Menu::query()->create($data);

        return to_route('admin.menus.index')->with('success', 'Menu zostało utworzone');
    }

    public function show(Menu $menu): Response
    {
        $menu->load(['items' => fn ($q) => $q->with(['children'])]);

        return inertia('admin/menus/show', [
            'menu' => $menu,
        ]);
    }

    public function edit(Menu $menu): Response
    {
        $menu->load(['items' => fn ($q) => $q->with(['children' => fn ($q) => $q->orderBy('position')])]);
        $locations = new MenuIndexQuery(request())->getLocations();

        return inertia('admin/menus/edit', [
            'menu' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'location' => $menu->location?->value,
                'is_active' => $menu->is_active,
                'items' => $menu->items->map(fn (MenuItem $item): array => $this->serializeItem($item))->values(),
            ],
            'locations' => $locations,
        ]);
    }

    public function update(UpdateMenuRequest $request, Menu $menu): RedirectResponse
    {
        $data = $request->validated();

        $menu->update([
            'name' => $data['name'],
            'location' => $data['location'],
            'is_active' => $data['is_active'] ?? $menu->is_active,
        ]);

        // Sync items: delete all, re-create from submitted tree
        $menu->allItems()->delete();

        foreach ($data['items'] ?? [] as $position => $itemData) {
            $this->createMenuItem($menu->id, $itemData, null, $position);
        }

        return back()->with('success', 'Menu zostało zaktualizowane');
    }

    public function destroy(Menu $menu): RedirectResponse
    {
        $menu->allItems()->delete();
        $menu->delete();

        return to_route('admin.menus.index')->with('success', 'Menu zostało usunięte');
    }

    public function duplicate(Menu $menu): RedirectResponse
    {
        $newMenu = $menu->replicate();
        $newMenu->name = $menu->name.' (Kopia)';
        $newMenu->location = null;
        $newMenu->save();

        // Kopiuj elementy menu
        foreach ($menu->allItems->whereNull('parent_id') as $item) {
            $this->duplicateMenuItem($item, $newMenu->id);
        }

        return to_route('admin.menus.edit', $newMenu)->with('success', 'Menu zostało skopiowane');
    }

    private function serializeItem(MenuItem $item): array
    {
        return [
            'id' => $item->id,
            'label' => $item->label,
            'url' => $item->url ?? '',
            'target' => $item->target ?? '_self',
            'icon' => $item->icon,
            'position' => $item->position,
            'parent_id' => $item->parent_id,
            'children' => $item->children->map(fn (MenuItem $c): array => $this->serializeItem($c))->values(),
        ];
    }

    private function createMenuItem(int $menuId, array $data, ?int $parentId, int $position): void
    {
        $item = MenuItem::query()->create([
            'menu_id' => $menuId,
            'parent_id' => $parentId,
            'label' => $data['label'],
            'url' => $data['url'] ?? '',
            'target' => $data['target'] ?? '_self',
            'icon' => $data['icon'] ?? null,
            'is_active' => true,
            'position' => $position,
        ]);

        foreach ($data['children'] ?? [] as $childPosition => $childData) {
            $this->createMenuItem($menuId, $childData, $item->id, $childPosition);
        }
    }

    private function duplicateMenuItem($item, $menuId, $parentId = null): void
    {
        $newItem = $item->replicate();
        $newItem->menu_id = $menuId;
        $newItem->parent_id = $parentId;
        $newItem->save();

        foreach ($item->children as $child) {
            $this->duplicateMenuItem($child, $menuId, $newItem->id);
        }
    }
}
