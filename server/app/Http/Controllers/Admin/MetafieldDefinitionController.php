<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMetafieldDefinitionRequest;
use App\Http\Requests\Admin\UpdateMetafieldDefinitionRequest;
use App\Models\MetafieldDefinition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class MetafieldDefinitionController extends Controller
{
    /** @var array<int, string> */
    private array $ownerTypes = [
        'App\Models\Product',
        'App\Models\BlogPost',
        'App\Models\Page',
        'App\Models\Category',
    ];

    public function index(Request $request): Response
    {
        $query = MetafieldDefinition::query()
            ->when($request->input('search'), function ($q, string $search): void {
                $q->where(function ($q) use ($search): void {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('namespace', 'like', "%{$search}%")
                        ->orWhere('key', 'like', "%{$search}%");
                });
            })
            ->when($request->input('owner_type'), fn ($q, string $type) => $q->where('owner_type', $type))
            ->orderBy('owner_type')
            ->orderBy('position')
            ->orderBy('name');

        $definitions = $query->paginate(20)->withQueryString();

        return inertia('admin/metafield-definitions/index', [
            'definitions' => $definitions,
            'filters' => $request->only(['search', 'owner_type']),
            'ownerTypes' => $this->ownerTypes,
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/metafield-definitions/create', [
            'ownerTypes' => $this->ownerTypes,
        ]);
    }

    public function store(StoreMetafieldDefinitionRequest $request): RedirectResponse
    {
        MetafieldDefinition::query()->create($request->validated());

        return to_route('admin.metafield-definitions.index')->with('success', 'Metafield definition created successfully');
    }

    public function edit(MetafieldDefinition $metafieldDefinition): Response
    {
        return inertia('admin/metafield-definitions/edit', [
            'definition' => $metafieldDefinition,
            'ownerTypes' => $this->ownerTypes,
        ]);
    }

    public function update(UpdateMetafieldDefinitionRequest $request, MetafieldDefinition $metafieldDefinition): RedirectResponse
    {
        $metafieldDefinition->update($request->validated());

        return back()->with('success', 'Metafield definition updated successfully');
    }

    public function destroy(MetafieldDefinition $metafieldDefinition): RedirectResponse
    {
        $metafieldDefinition->delete();

        return back()->with('success', 'Metafield definition deleted successfully');
    }
}
