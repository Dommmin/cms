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
use App\Services\PagePreviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class PageBuilderController extends Controller
{
    public function __construct(
        private readonly PageBuilderSyncService $syncService,
        private readonly PagePreviewService $pagePreviewService,
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
                'approval_status' => $pageModel->approval_status ?? 'draft',
                'review_note' => $pageModel->review_note,
                'scheduled_publish_at' => $pageModel->scheduled_publish_at?->toIso8601String(),
                'scheduled_unpublish_at' => $pageModel->scheduled_unpublish_at?->toIso8601String(),
            ],
            'sections' => $sections,
            'available_sections' => config('cms.sections', []),
            'available_block_relations' => config('blocks.block_types', []),
        ]);
    }

    public function previewUrl(Page $page): JsonResponse
    {
        $token = $this->pagePreviewService->createToken($page, null, null, 30);
        $frontendUrl = mb_rtrim(config('app.frontend_url', 'http://localhost:3000'), '/');

        return response()->json([
            'url' => $frontendUrl.'/api/preview?token='.$token.'&slug='.urlencode($page->slug),
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

    public function export(Page $page): SymfonyResponse
    {
        $sections = $page->allSections()->with(['allBlocks'])->orderBy('position')->get();

        $data = [
            'version' => '1.0',
            'exported_at' => now()->toIso8601String(),
            'page_title' => $page->title,
            'sections' => $sections->map(fn (PageSection $s): array => [
                'section_type' => $s->section_type,
                'layout' => $s->layout,
                'variant' => $s->variant,
                'settings' => $s->settings,
                'position' => $s->position,
                'is_active' => $s->is_active,
                'blocks' => $s->allBlocks->map(fn (PageBlock $b): array => [
                    'type' => $b->type->value,
                    'configuration' => $b->configuration,
                    'position' => $b->position,
                    'is_active' => $b->is_active,
                ])->values()->all(),
            ])->values()->all(),
        ];

        $filename = 'page-'.$page->id.'-'.now()->format('Y-m-d').'.json';

        return response((string) json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    public function import(Request $request, Page $page): RedirectResponse
    {
        $request->validate(['file' => ['required', 'file', 'mimes:json', 'max:2048']]);

        $content = (string) file_get_contents((string) $request->file('file')->getRealPath());
        $data = json_decode($content, true);

        if (! isset($data['sections']) || ! is_array($data['sections'])) {
            return back()->withErrors(['file' => 'Invalid page export file.']);
        }

        $page->allBlocks()->delete();
        $page->allSections()->delete();

        foreach ($data['sections'] as $sectionData) {
            $section = $page->allSections()->create([
                'section_type' => $sectionData['section_type'] ?? 'content',
                'layout' => $sectionData['layout'] ?? 'contained',
                'variant' => $sectionData['variant'] ?? null,
                'settings' => $sectionData['settings'] ?? null,
                'position' => $sectionData['position'] ?? 0,
                'is_active' => $sectionData['is_active'] ?? true,
            ]);

            foreach ($sectionData['blocks'] ?? [] as $blockData) {
                $section->allBlocks()->create([
                    'page_id' => $page->id,
                    'type' => $blockData['type'],
                    'configuration' => $blockData['configuration'] ?? [],
                    'position' => $blockData['position'] ?? 0,
                    'is_active' => $blockData['is_active'] ?? true,
                ]);
            }
        }

        return back()->with('success', 'Page imported successfully.');
    }
}
