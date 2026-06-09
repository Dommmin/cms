<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Cms;

use App\Enums\SlotLocationEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Cms\StoreGlobalSlotRequest;
use App\Http\Requests\Admin\Cms\UpdateGlobalSlotRequest;
use App\Models\GlobalSlot;
use App\Models\ReusableBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GlobalSlotController extends Controller
{
    public function index(): Response
    {
        $slots = GlobalSlot::query()
            ->with('reusableBlock')
            ->orderBy('position')
            ->get()
            ->map(fn (GlobalSlot $slot): array => [
                'id' => $slot->id,
                'location' => $slot->location->value,
                'reusable_block_id' => $slot->reusable_block_id,
                'label' => $slot->label,
                'configuration' => $slot->configuration,
                'is_active' => $slot->is_active,
                'position' => $slot->position,
                'settings' => $slot->settings,
                'reusable_block' => $slot->reusableBlock ? [
                    'id' => $slot->reusableBlock->id,
                    'name' => $slot->reusableBlock->name,
                    'type' => $slot->reusableBlock->type,
                ] : null,
            ]);

        $locations = collect(SlotLocationEnum::cases())->map(fn (SlotLocationEnum $loc): array => [
            'value' => $loc->value,
            'label' => $loc->label(),
            'default_settings' => $loc->defaultSettings(),
        ]);

        $reusableBlocks = ReusableBlock::query()
            ->where('is_active', true)
            ->get(['id', 'name', 'type']);

        return Inertia::render('admin/cms/global-slots/index', [
            'slots' => $slots,
            'locations' => $locations,
            'reusable_blocks' => $reusableBlocks,
        ]);
    }

    public function store(StoreGlobalSlotRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // If no settings provided, use defaults for location
        if (empty($validated['settings'])) {
            $location = SlotLocationEnum::from($validated['location']);
            $validated['settings'] = $location->defaultSettings();
        }

        // Auto-position to the end of the location
        if (! isset($validated['position'])) {
            $maxPos = GlobalSlot::query()
                ->where('location', $validated['location'])
                ->max('position');
            $validated['position'] = $maxPos !== null ? $maxPos + 1 : 0;
        }

        GlobalSlot::query()->create($validated);

        return back()->with('success', 'Slot created successfully');
    }

    public function update(UpdateGlobalSlotRequest $request, GlobalSlot $globalSlot): RedirectResponse
    {
        $validated = $request->validated();
        $globalSlot->update($validated);

        return back()->with('success', 'Slot updated successfully');
    }

    public function destroy(GlobalSlot $globalSlot): RedirectResponse
    {
        $globalSlot->delete();

        return back()->with('success', 'Slot deleted successfully');
    }

    public function toggle(Request $request, GlobalSlot $globalSlot): RedirectResponse
    {
        $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $globalSlot->update([
            'is_active' => $request->input('is_active'),
        ]);

        return back()->with('success', 'Slot status updated');
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'slots' => ['required', 'array'],
            'slots.*.id' => ['required', 'integer', 'exists:global_slots,id'],
            'slots.*.position' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->input('slots') as $item) {
            GlobalSlot::query()
                ->where('id', $item['id'])
                ->update(['position' => $item['position']]);
        }

        return response()->json(['message' => 'Slots reordered successfully']);
    }
}
