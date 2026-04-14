<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Cms\AddBlockRequest;
use App\Http\Requests\Admin\Cms\AddSectionRequest;
use App\Http\Requests\Admin\Cms\SchedulePageRequest;
use App\Http\Requests\Admin\Cms\UpdateBlockRequest;
use App\Http\Requests\Admin\Cms\UpdatePageBuilderRequest;
use App\Http\Requests\Admin\Cms\UpdateSectionRequest;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use App\Services\PageBuilderSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PageBuilderController extends Controller
{
    public function __construct(
        private readonly PageBuilderSyncService $syncService
    ) {}

    public function show(int $page)
    {
        $pageModel = Page::with(['sections.blocks', 'sections.allBlocks', 'sections.blocks.relations', 'sections.blocks.reusableBlock'])->findOrFail($page);

        $sections = $pageModel->sections->map(fn (PageSection $section): array => [
            'id' => $section->id,
            'section_type' => $section->section_type,
            'layout' => $section->layout,
            'variant' => $section->variant,
            'settings' => $section->settings,
            'position' => $section->position,
            'is_active' => $section->is_active,
            'blocks' => $section->blocks->map(fn (PageBlock $block): array => [
                'id' => $block->id,
                'type' => $block->type->value,
                'configuration' => $block->configuration,
                'position' => $block->position,
                'is_active' => $block->is_active,
                'reusable_block_id' => $block->reusable_block_id,
                'reusable_block_name' => $block->reusableBlock?->name,
                'relations' => $block->relations->map(fn ($rel): array => [
                    'id' => $rel->id,
                    'relation_type' => $rel->relation_type,
                    'relation_id' => $rel->relation_id,
                    'relation_key' => $rel->relation_key,
                    'position' => $rel->position,
                    'metadata' => $rel->metadata,
                ])->all(),
            ]),
        ]);

        return Inertia::render('admin/cms/pages/builder', [
            'page' => [
                'id' => $pageModel->id,
                'title' => $pageModel->title,
                'slug' => $pageModel->slug,
            ],
            'sections' => $sections,
            'available_sections' => config('cms.sections', []),
            'available_block_relations' => config('blocks.block_types', []),
        ]);
    }

    public function preview(int $page): Response
    {
        $pageModel = Page::with([
            'sections' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
            'sections.blocks' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
        ])->findOrFail($page);

        $sections = $pageModel->sections->map(fn (PageSection $section): array => [
            'id' => $section->id,
            'section_type' => $section->section_type,
            'layout' => $section->layout,
            'variant' => $section->variant,
            'settings' => $section->settings,
            'blocks' => $section->blocks->map(fn (PageBlock $block): array => [
                'id' => $block->id,
                'type' => $block->type->value,
                'configuration' => $block->configuration,
            ]),
        ]);

        return Inertia::render('admin/cms/pages/page-preview', [
            'page' => [
                'id' => $pageModel->id,
                'title' => $pageModel->title,
                'slug' => $pageModel->slug,
            ],
            'sections' => $sections,
        ]);
    }

    public function update(UpdatePageBuilderRequest $request, int $page): RedirectResponse
    {
        $request->validated();

        $snapshot = $request->input('snapshot');
        if (is_array($snapshot)) {
            $pageModel = Page::query()->findOrFail($page);
            $this->syncService->sync($pageModel, $snapshot);

            return back();
        }

        $page = Page::query()->findOrFail($request->get('page_id', $page));

        $sections = $request->input('sections', []);

        $page->allBlocks()->delete();
        $page->allSections()->delete();

        foreach ($sections as $sectionIndex => $sectionData) {
            $section = $page->allSections()->create([
                'section_type' => $sectionData['section_type'],
                'layout' => $sectionData['layout'] ?? 'default',
                'variant' => $sectionData['variant'] ?? null,
                'settings' => $sectionData['settings'] ?? null,
                'position' => $sectionData['position'] ?? $sectionIndex,
                'is_active' => $sectionData['is_active'] ?? true,
            ]);

            foreach ($sectionData['blocks'] ?? [] as $blockIndex => $blockData) {
                $block = $section->allBlocks()->create([
                    'page_id' => $page->id,
                    'type' => $blockData['type'],
                    'configuration' => $blockData['configuration'] ?? null,
                    'position' => $blockData['position'] ?? $blockIndex,
                    'reusable_block_id' => $blockData['reusable_block_id'] ?? null,
                    'is_active' => $blockData['is_active'] ?? true,
                ]);

                foreach ($blockData['relations'] ?? [] as $relation) {
                    $block->relations()->create([
                        'relation_type' => $relation['relation_type'],
                        'relation_id' => $relation['relation_id'],
                        'relation_key' => $relation['relation_key'],
                        'position' => $relation['position'] ?? 0,
                        'metadata' => $relation['metadata'] ?? null,
                    ]);
                }
            }
        }

        return back();
    }

    public function schedule(SchedulePageRequest $request, int $page): RedirectResponse
    {
        $pageModel = Page::query()->findOrFail($page);

        $pageModel->update([
            'scheduled_publish_at' => $request->input('scheduled_publish_at'),
            'scheduled_unpublish_at' => $request->input('scheduled_unpublish_at'),
        ]);

        return back()->with('success', 'Schedule saved.');
    }

    public function addSection(AddSectionRequest $request, int $page): JsonResponse
    {
        $request->validated();

        $page = Page::query()->findOrFail($page);

        $sectionConfig = config('cms.sections.'.$request->input('section_type'));

        $section = $page->allSections()->create([
            'section_type' => $request->input('section_type'),
            'layout' => $sectionConfig['layouts'][0] ?? 'default',
            'variant' => $sectionConfig['variants'][0] ?? null,
            'settings' => null,
            'position' => $request->input('position', $page->allSections()->count()),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'section' => [
                'id' => $section->id,
                'section_type' => $section->section_type,
                'layout' => $section->layout,
                'variant' => $section->variant,
                'settings' => $section->settings,
                'position' => $section->position,
                'is_active' => $section->is_active,
                'blocks' => [],
            ],
        ]);
    }

    public function updateSection(UpdateSectionRequest $request, int $page, int $section): JsonResponse
    {
        $section = PageSection::query()->where('page_id', $page)->findOrFail($section);

        $request->validated();

        $section->update($request->only([
            'section_type', 'layout', 'variant', 'settings', 'position', 'is_active',
        ]));

        return response()->json(['success' => true, 'section' => $section]);
    }

    public function deleteSection(int $page, int $section): JsonResponse
    {
        $section = PageSection::query()->where('page_id', $page)->findOrFail($section);
        $section->allBlocks()->delete();
        $section->delete();

        return response()->json(['success' => true]);
    }

    public function addBlock(AddBlockRequest $request, int $page, int $section): JsonResponse
    {
        $request->validated();

        $section = PageSection::query()->where('page_id', $page)->findOrFail($section);

        $block = $section->allBlocks()->create([
            'page_id' => $page,
            'type' => $request->input('type'),
            'configuration' => null,
            'position' => $request->input('position', $section->allBlocks()->count()),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'block' => [
                'id' => $block->id,
                'type' => $block->type->value,
                'configuration' => $block->configuration,
                'position' => $block->position,
                'is_active' => $block->is_active,
            ],
        ]);
    }

    public function updateBlock(UpdateBlockRequest $request, int $page, int $section, int $block): JsonResponse
    {
        $block = PageBlock::query()->where('page_id', $page)->where('section_id', $section)->findOrFail($block);

        $request->validated();

        $block->update($request->only(['configuration', 'position', 'is_active']));

        return response()->json(['success' => true, 'block' => $block]);
    }

    public function deleteBlock(int $page, int $section, int $block): JsonResponse
    {
        $block = PageBlock::query()->where('page_id', $page)->where('section_id', $section)->findOrFail($block);
        $block->delete();

        return response()->json(['success' => true]);
    }
}
