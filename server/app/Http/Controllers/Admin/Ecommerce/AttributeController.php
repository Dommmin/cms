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
            $this->upsertValues($attribute, $values);
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

        DB::transaction(function () use ($attribute, $data): void {
            $values = $data['values'] ?? null;
            unset($data['values']);

            $attribute->update($data);

            if (is_array($values)) {
                $this->upsertValues($attribute, $values);
            }
        });

        return back()->with('success', 'Atrybut został zaktualizowany');
    }

    public function destroy(Attribute $attribute): RedirectResponse
    {
        $attribute->delete();

        return back()->with('success', 'Atrybut został usunięty');
    }

    /**
     * @param  array<int, array<string, mixed>>  $values
     */
    private function upsertValues(Attribute $attribute, array $values): void
    {
        foreach ($values as $index => $valueData) {
            $payload = [
                'value' => $valueData['value'],
                'slug' => $valueData['slug'],
                'color_hex' => $valueData['color_hex'] ?? null,
                'position' => $valueData['position'] ?? $index,
            ];

            if (isset($valueData['id'])) {
                $attribute->values()
                    ->whereKey($valueData['id'])
                    ->update($payload);

                continue;
            }

            $attribute->values()->create($payload);
        }
    }
}
