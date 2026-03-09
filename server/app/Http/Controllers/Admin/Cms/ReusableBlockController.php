<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Cms;

use App\Http\Controllers\Controller;
use App\Models\ReusableBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReusableBlockController extends Controller
{
    public function index(): Response
    {
        $blocks = ReusableBlock::query()
            ->withCount('pageBlocks')
            ->latest()
            ->get()
            ->map(fn (ReusableBlock $block) => [
                'id' => $block->id,
                'name' => $block->name,
                'description' => $block->description,
                'type' => $block->type,
                'is_active' => $block->is_active,
                'page_blocks_count' => $block->page_blocks_count,
                'created_at' => $block->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('admin/cms/reusable-blocks/index', [
            'blocks' => $blocks,
            'available_block_types' => config('blocks.block_types'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['required', 'string'],
            'configuration' => ['nullable', 'array'],
            'relations_config' => ['nullable', 'array'],
        ]);

        $block = ReusableBlock::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'configuration' => $validated['configuration'] ?? [],
            'relations_config' => $validated['relations_config'] ?? [],
            'is_active' => true,
        ]);

        return response()->json([
            'id' => $block->id,
            'name' => $block->name,
        ], 201);
    }

    public function show(ReusableBlock $reusableBlock): JsonResponse
    {
        return response()->json([
            'id' => $reusableBlock->id,
            'name' => $reusableBlock->name,
            'description' => $reusableBlock->description,
            'type' => $reusableBlock->type,
            'configuration' => $reusableBlock->configuration,
            'relations_config' => $reusableBlock->relations_config,
            'is_active' => $reusableBlock->is_active,
        ]);
    }

    public function update(Request $request, ReusableBlock $reusableBlock): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'configuration' => ['nullable', 'array'],
            'relations_config' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ]);

        $reusableBlock->update($validated);

        // Propagate to all linked PageBlocks
        $reusableBlock->syncToPageBlocks();

        return back();
    }

    public function destroy(ReusableBlock $reusableBlock): RedirectResponse
    {
        // Unlink all page blocks before deleting
        $reusableBlock->pageBlocks()->update(['reusable_block_id' => null]);
        $reusableBlock->delete();

        return back();
    }

    /**
     * Return all active global blocks for the block library picker (JSON).
     */
    public function library(): JsonResponse
    {
        $blocks = ReusableBlock::query()
            ->where('is_active', true)
            ->latest()
            ->get()
            ->map(fn (ReusableBlock $block) => [
                'id' => $block->id,
                'name' => $block->name,
                'description' => $block->description,
                'type' => $block->type,
                'configuration' => $block->configuration,
                'relations_config' => $block->relations_config,
            ]);

        return response()->json($blocks);
    }
}
