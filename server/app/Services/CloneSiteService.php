<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\BlockRelation;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use Illuminate\Support\Facades\DB;

class CloneSiteService
{
    /**
     * Clone all pages from $sourceLocale to $targetLocale.
     *
     * @param  string  $sourceLocale  'global' = locale IS NULL, or a locale code
     * @param  string  $targetLocale  locale code e.g. 'pl', 'en'
     *
     * @throws \RuntimeException when target locale already has pages
     */
    public function clone(string $sourceLocale, string $targetLocale): void
    {
        $resolvedSource = $sourceLocale === 'global' ? null : $sourceLocale;

        $existingCount = Page::query()
            ->where('locale', $targetLocale)
            ->count();

        if ($existingCount > 0) {
            throw new \RuntimeException(
                "Target locale '{$targetLocale}' already has {$existingCount} page(s). Delete them first or choose a different target locale.",
            );
        }

        DB::transaction(function () use ($resolvedSource, $targetLocale): void {
            $sourcePages = Page::query()
                ->when(
                    $resolvedSource === null,
                    fn ($q) => $q->whereNull('locale'),
                    fn ($q) => $q->where('locale', $resolvedSource),
                )
                ->with([
                    'allSections' => fn ($q) => $q->orderBy('position'),
                    'allSections.allBlocks' => fn ($q) => $q->orderBy('position'),
                    'allSections.allBlocks.relations',
                ])
                ->orderBy('id')
                ->get();

            // Map old page IDs → new page IDs for parent_id remapping
            $pageIdMap = [];

            foreach ($sourcePages as $sourcePage) {
                $newPage = $sourcePage->replicate([
                    'published_version_id',
                    'draft_version_id',
                    'published_at',
                    'builder_snapshot',
                ]);
                $newPage->locale = $targetLocale;
                $newPage->is_published = false;
                $newPage->published_at = null;
                $newPage->published_version_id = null;
                $newPage->draft_version_id = null;
                // Temporarily clear parent_id; will be remapped after all pages are created
                $originalParentId = $sourcePage->parent_id;
                $newPage->parent_id = null;
                $newPage->save();

                $pageIdMap[$sourcePage->id] = ['new_id' => $newPage->id, 'old_parent' => $originalParentId];

                $this->cloneSections($sourcePage, $newPage);
            }

            // Remap parent_id to new page IDs
            foreach ($pageIdMap as $oldId => $data) {
                if ($data['old_parent'] !== null && isset($pageIdMap[$data['old_parent']])) {
                    Page::where('id', $data['new_id'])->update([
                        'parent_id' => $pageIdMap[$data['old_parent']]['new_id'],
                    ]);
                }
            }
        });
    }

    private function cloneSections(Page $sourcePage, Page $newPage): void
    {
        foreach ($sourcePage->allSections as $section) {
            $newSection = $newPage->allSections()->create([
                'section_type' => $section->section_type,
                'layout'       => $section->layout,
                'variant'      => $section->variant,
                'settings'     => $section->settings,
                'position'     => $section->position,
                'is_active'    => $section->is_active,
            ]);

            $this->cloneBlocks($section, $newSection, $newPage->id);
        }
    }

    private function cloneBlocks(PageSection $sourceSection, PageSection $newSection, int $newPageId): void
    {
        foreach ($sourceSection->allBlocks as $block) {
            $newBlock = $newSection->allBlocks()->create([
                'page_id'           => $newPageId,
                'type'              => $block->type,
                'configuration'     => $block->configuration,
                'position'          => $block->position,
                'is_active'         => $block->is_active,
                'reusable_block_id' => $block->reusable_block_id,
            ]);

            foreach ($block->relations as $relation) {
                $newBlock->relations()->create([
                    'relation_type' => $relation->relation_type,
                    'relation_id'   => $relation->relation_id,
                    'relation_key'  => $relation->relation_key,
                    'position'      => $relation->position,
                    'metadata'      => $relation->metadata,
                ]);
            }
        }
    }
}
