<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\BlockRelation;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use Illuminate\Database\Eloquent\Collection;

class PageBuilderSyncService
{
    /**
     * @param  array<string, mixed>  $snapshot
     */
    public function sync(Page $page, array $snapshot): void
    {
        /** @var Collection<int, PageSection> $existingSections */
        $existingSections = $page->allSections()->get()->keyBy('id');

        /** @var Collection<int, PageBlock> $existingBlocks */
        $existingBlocks = $page->allBlocks()->with('relations')->get()->keyBy('id');

        $retainedSectionIds = [];
        $retainedBlockIds = [];

        foreach ($snapshot['sections'] ?? [] as $sectionIndex => $section) {
            $sectionModel = $this->syncSection($page, $existingSections, $section, $sectionIndex);
            $retainedSectionIds[] = $sectionModel->id;

            foreach ($section['blocks'] ?? [] as $blockIndex => $block) {
                $blockModel = $this->syncBlock($page, $sectionModel, $existingBlocks, $block, $blockIndex);
                $retainedBlockIds[] = $blockModel->id;

                $this->syncRelations($blockModel, $block['relations'] ?? []);
            }
        }

        $this->deleteMissingBlocks($page, $retainedBlockIds);
        $this->deleteMissingSections($page, $retainedSectionIds);
    }

    /**
     * @param  Collection<int, PageSection>  $existingSections
     * @param  array<string, mixed>  $section
     */
    private function syncSection(Page $page, Collection $existingSections, array $section, int $sectionIndex): PageSection
    {
        $sectionId = $this->integerId($section['id'] ?? null);
        $attributes = [
            'page_id' => $page->id,
            'section_type' => $section['section_type'] ?? '',
            'layout' => $section['layout'] ?? 'default',
            'variant' => $section['variant'] ?? null,
            'settings' => $section['settings'] ?? null,
            'position' => $section['position'] ?? $sectionIndex,
            'is_active' => $section['is_active'] ?? true,
        ];

        $sectionModel = $sectionId !== null ? $existingSections->get($sectionId) : null;
        if ($sectionModel instanceof PageSection) {
            $sectionModel->fill($attributes);
            $sectionModel->save();

            return $sectionModel;
        }

        /** @var PageSection $createdSection */
        $createdSection = $page->allSections()->create($attributes);

        return $createdSection;
    }

    /**
     * @param  Collection<int, PageBlock>  $existingBlocks
     * @param  array<string, mixed>  $block
     */
    private function syncBlock(
        Page $page,
        PageSection $section,
        Collection $existingBlocks,
        array $block,
        int $blockIndex,
    ): PageBlock {
        $blockId = $this->integerId($block['id'] ?? null);
        $attributes = [
            'page_id' => $page->id,
            'section_id' => $section->id,
            'type' => $block['type'] ?? '',
            'configuration' => $block['configuration'] ?? null,
            'position' => $block['position'] ?? $blockIndex,
            'is_active' => $block['is_active'] ?? true,
            'reusable_block_id' => $block['reusable_block_id'] ?? null,
        ];

        $blockModel = $blockId !== null ? $existingBlocks->get($blockId) : null;
        if ($blockModel instanceof PageBlock) {
            $blockModel->fill($attributes);
            $blockModel->save();

            return $blockModel;
        }

        /** @var PageBlock $createdBlock */
        $createdBlock = $section->allBlocks()->create($attributes);

        return $createdBlock;
    }

    /**
     * @param  array<int, array<string, mixed>>  $relations
     */
    private function syncRelations(PageBlock $block, array $relations): void
    {
        /** @var Collection<int, BlockRelation> $existingRelations */
        $existingRelations = $block->relations()->get()->keyBy('id');
        $retainedRelationIds = [];

        foreach ($relations as $relationIndex => $relation) {
            $relationId = $this->integerId($relation['id'] ?? null);
            $attributes = [
                'page_block_id' => $block->id,
                'relation_type' => $relation['relation_type'],
                'relation_id' => $relation['relation_id'],
                'relation_key' => $relation['relation_key'] ?? null,
                'position' => $relation['position'] ?? $relationIndex,
                'metadata' => $relation['metadata'] ?? null,
            ];

            $relationModel = $relationId !== null ? $existingRelations->get($relationId) : null;
            if ($relationModel instanceof BlockRelation) {
                $relationModel->fill($attributes);
                $relationModel->save();
            } else {
                /** @var BlockRelation $relationModel */
                $relationModel = $block->relations()->create($attributes);
            }

            $retainedRelationIds[] = $relationModel->id;
        }

        if ($retainedRelationIds === []) {
            $block->relations()->delete();

            return;
        }

        $block->relations()->whereNotIn('id', $retainedRelationIds)->delete();
    }

    /**
     * @param  array<int, int>  $retainedBlockIds
     */
    private function deleteMissingBlocks(Page $page, array $retainedBlockIds): void
    {
        if ($retainedBlockIds === []) {
            $page->allBlocks()->delete();

            return;
        }

        $page->allBlocks()->whereNotIn('id', $retainedBlockIds)->delete();
    }

    /**
     * @param  array<int, int>  $retainedSectionIds
     */
    private function deleteMissingSections(Page $page, array $retainedSectionIds): void
    {
        if ($retainedSectionIds === []) {
            $page->allSections()->delete();

            return;
        }

        $page->allSections()->whereNotIn('id', $retainedSectionIds)->delete();
    }

    private function integerId(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value;
        }

        if (is_string($value) && ctype_digit($value)) {
            return (int) $value;
        }

        return null;
    }
}
