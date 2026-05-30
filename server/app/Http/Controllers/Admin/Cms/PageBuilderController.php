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
use App\Models\BlockRelation;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use App\Services\PageBuilder\PageBuilderSnapshotValidator;
use App\Services\PageBuilderSyncService;
use App\Services\PagePreviewService;
use App\Services\PageVersionService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class PageBuilderController extends Controller
{
    public function __construct(
        private readonly PageBuilderSyncService $syncService,
        private readonly PagePreviewService $pagePreviewService,
        private readonly PageBuilderSnapshotValidator $snapshotValidator,
        private readonly PageVersionService $pageVersionService,
    ) {}

    public function show(Request $request, int $page)
    {
        $pageModel = Page::with(['sections.blocks', 'sections.allBlocks', 'sections.blocks.relations', 'sections.blocks.reusableBlock'])->findOrFail($page);

        // @phpstan-ignore-next-line map callback returns a collection of blocks with type string instead of literal enum values union
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
                'relations' => (function () use ($block): array {
                    /** @var Collection<int, BlockRelation> $relations */
                    $relations = $block->relations;

                    return $relations->map(fn (BlockRelation $rel): array => [
                        'id' => $rel->id,
                        'relation_type' => $rel->relation_type,
                        'relation_id' => $rel->relation_id,
                        'relation_key' => $rel->relation_key,
                        'position' => $rel->position,
                        'metadata' => $rel->metadata,
                    ])->all();
                })(),
            ]),
        ]);

        $customHtmlEnabled = (bool) config('blocks.custom_html_enabled', true);

        return Inertia::render('admin/cms/pages/builder', [
            'page' => [
                'id' => $pageModel->id,
                'title' => $pageModel->title,
                'slug' => $pageModel->slug,
                'version' => $pageModel->version ?? 0,
                'approval_status' => $pageModel->approval_status ?? 'draft',
                'review_note' => $pageModel->review_note,
                'scheduled_publish_at' => $pageModel->scheduled_publish_at?->toIso8601String(),
                'scheduled_unpublish_at' => $pageModel->scheduled_unpublish_at?->toIso8601String(),
            ],
            'sections' => $sections,
            'available_sections' => config('cms.sections', []),
            'available_block_relations' => config('blocks.block_types', []),
            'capabilities' => [
                'can_manage_custom_html' => $customHtmlEnabled && ($request->user()?->can('cms.custom_html.manage') ?? false),
            ],
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

    public function update(UpdatePageBuilderRequest $request, int $page): RedirectResponse|JsonResponse
    {
        $result = $this->persistBuilderSnapshot(
            pageId: $page,
            snapshot: $request->input('snapshot'),
            expectedVersion: $request->has('expected_version') ? (int) $request->input('expected_version') : null,
            source: 'manual',
            changeNote: 'Manual builder save',
            isAutosave: false,
        );

        if (isset($result['conflict'])) {
            return response()->json([
                'message' => 'The page has been modified by another editor. Please refresh and try again.',
                'current_version' => $result['current_version'],
            ], 409);
        }

        return back();
    }

    public function autosave(UpdatePageBuilderRequest $request, int $page): JsonResponse
    {
        $result = $this->persistBuilderSnapshot(
            pageId: $page,
            snapshot: $request->input('snapshot'),
            expectedVersion: $request->has('expected_version') ? (int) $request->input('expected_version') : null,
            source: 'autosave',
            changeNote: 'Autosave',
            isAutosave: true,
        );

        if (isset($result['conflict'])) {
            return response()->json([
                'message' => 'Conflict: page was modified externally.',
                'current_version' => $result['current_version'],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'version' => $result['version'],
            'saved_at' => now()->toIso8601String(),
        ]);
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

        /** @var PageSection $section */
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

        /** @var PageBlock $block */
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
        /** @var Collection<int, PageSection> $sections */
        $sections = $page->allSections()->with(['allBlocks.relations'])->orderBy('position')->get();

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
                    'relations' => (function () use ($b): array {
                        /** @var Collection<int, BlockRelation> $relations */
                        $relations = $b->relations;

                        return $relations->map(fn (BlockRelation $rel): array => [
                            'relation_type' => $rel->relation_type,
                            'relation_id' => $rel->relation_id,
                            'relation_key' => $rel->relation_key,
                            'position' => $rel->position,
                            'metadata' => $rel->metadata,
                        ])->values()->all();
                    })(),
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

        if (! is_array($data) || ! isset($data['sections']) || ! is_array($data['sections'])) {
            return back()->withErrors(['file' => 'Invalid page export file.']);
        }

        try {
            $snapshot = $this->snapshotValidator->validateAndSanitize([
                'sections' => $data['sections'],
            ], user: $request->user());
        } catch (ValidationException $validationException) {
            return back()->withErrors($validationException->errors());
        }

        $this->persistBuilderSnapshot(
            pageId: $page->id,
            snapshot: $snapshot,
            expectedVersion: null,
            source: 'import',
            changeNote: 'Builder import',
            isAutosave: false,
        );

        return back()->with('success', 'Page imported successfully.');
    }

    /**
     * @param  array<string, mixed>  $snapshot
     * @return array{version?: int, current_version?: int, conflict?: true}
     */
    private function persistBuilderSnapshot(
        int $pageId,
        array $snapshot,
        ?int $expectedVersion,
        string $source,
        string $changeNote,
        bool $isAutosave,
    ): array {
        return DB::transaction(function () use ($pageId, $snapshot, $expectedVersion, $source, $changeNote, $isAutosave): array {
            /** @var Page $page */
            $page = Page::query()
                ->whereKey($pageId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($expectedVersion !== null && $expectedVersion !== (int) $page->version) {
                return [
                    'conflict' => true,
                    'current_version' => (int) $page->version,
                ];
            }

            $this->syncService->sync($page, $snapshot);

            $page->forceFill(['version' => (int) $page->version + 1])->save();
            $page->refresh();

            $this->pageVersionService->createVersion(
                page: $page,
                userId: Auth::id(),
                changeNote: $changeNote,
                isAutosave: $isAutosave,
                source: $source,
            );

            return ['version' => (int) $page->version];
        });
    }
}
