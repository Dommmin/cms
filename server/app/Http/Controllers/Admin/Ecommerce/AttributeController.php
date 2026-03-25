<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreAttributeRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateAttributeRequest;
use App\Models\Attribute;
use App\Queries\Admin\AttributeIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class AttributeController extends Controller
{
    public function index(Request $request): Response
    {
        $attributeQuery = new AttributeIndexQuery($request);
        $attributes = $attributeQuery->execute();

        return inertia('admin/ecommerce/attributes/index', [
            'attributes' => $attributes,
            'filters' => $request->only(['search', 'type', 'is_filterable', 'is_variant_selection']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/ecommerce/attributes/create');
    }

    public function store(StoreAttributeRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['is_filterable'] ??= false;
        $data['is_variant_selection'] ??= false;
        $data['position'] ??= 0;

        DB::transaction(function () use ($data): void {
            $values = $data['values'] ?? [];
            unset($data['values']);

            $attribute = Attribute::query()->create($data);

            foreach ($values as $index => $valueData) {
                $attribute->values()->create([
                    'value' => $valueData['value'],
                    'label' => $valueData['label'] ?? $valueData['value'],
                    'color_code' => $valueData['color_code'] ?? null,
                    'position' => $valueData['position'] ?? $index,
                ]);
            }
        });

        return to_route('admin.ecommerce.attributes.index')->with('success', 'Atrybut został utworzony');
    }

    public function edit(Attribute $attribute): Response
    {
        $attribute->load(['values' => fn ($q) => $q->orderBy('position')]);

        return inertia('admin/ecommerce/attributes/edit', [
            'attribute' => $attribute,
        ]);
    }

    public function update(UpdateAttributeRequest $request, Attribute $attribute): RedirectResponse
    {
        $data = $request->validated();

        $attribute->update($data);

        return back()->with('success', 'Atrybut został zaktualizowany');
    }

    public function destroy(Attribute $attribute): RedirectResponse
    {
        $attribute->delete();

        return back()->with('success', 'Atrybut został usunięty');
    }
}
