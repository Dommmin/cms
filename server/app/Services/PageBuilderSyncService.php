<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Page;

class PageBuilderSyncService
{
    public function sync(Page $page, array $snapshot): void
    {
        $page->allBlocks()->delete();
        $page->allSections()->delete();

        foreach ($snapshot['sections'] ?? [] as $sectionIndex => $section) {
            $sectionModel = $page->allSections()->create([
                'section_type' => $section['section_type'] ?? '',
                'layout' => $section['layout'] ?? 'default',
                'variant' => $section['variant'] ?? null,
                'settings' => $section['settings'] ?? null,
                'position' => $section['position'] ?? $sectionIndex,
                'is_active' => $section['is_active'] ?? true,
            ]);

            foreach ($section['blocks'] ?? [] as $blockIndex => $block) {
                $blockModel = $sectionModel->allBlocks()->create([
                    'page_id' => $page->id,
                    'type' => $block['type'] ?? '',
                    'configuration' => $block['configuration'] ?? null,
                    'position' => $block['position'] ?? $blockIndex,
                    'is_active' => $block['is_active'] ?? true,
                ]);

                foreach ($block['relations'] ?? [] as $relation) {
                    $blockModel->relations()->create([
                        'relation_type' => $relation['relation_type'],
                        'relation_id' => $relation['relation_id'],
                        'relation_key' => $relation['relation_key'] ?? null,
                        'position' => $relation['position'] ?? 0,
                        'metadata' => $relation['metadata'] ?? null,
                    ]);
                }
            }
        }
    }
}
