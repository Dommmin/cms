<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Page;
use RuntimeException;

class PageBuilderRulesService
{
    /**
     * Enforce business rules from config (blocks.block_types.*.business_rules).
     */
    public function enforce(Page $page): void
    {
        $snapshot = $page->builder_snapshot;
        if (! is_array($snapshot)) {
            return;
        }

        $blockTypes = [];
        foreach (($snapshot['sections'] ?? []) as $sectionIndex => $section) {
            if (! is_array($section)) {
                continue;
            }

            foreach (($section['blocks'] ?? []) as $block) {
                if (! is_array($block)) {
                    continue;
                }

                if (! isset($block['type'])) {
                    continue;
                }

                $blockTypes[] = [
                    'type' => $block['type'],
                    'section_index' => $sectionIndex,
                ];
            }
        }

        $counts = [];
        foreach ($blockTypes as $item) {
            $type = $item['type'];
            $counts[$type] = ($counts[$type] ?? 0) + 1;
        }

        $blocksConfig = config('blocks.block_types', []);
        foreach ($counts as $blockType => $count) {
            $blockConfig = $blocksConfig[$blockType] ?? null;
            if (! is_array($blockConfig)) {
                continue;
            }

            $businessRules = $blockConfig['business_rules'] ?? null;
            if (! is_array($businessRules)) {
                continue;
            }

            $maxPerPage = $businessRules['max_per_page'] ?? null;
            if ($maxPerPage !== null && $count > $maxPerPage) {
                $label = $blockConfig['name'] ?? $blockType;
                throw new RuntimeException(
                    __('page_builder.errors.max_per_page', ['count' => $maxPerPage, 'label' => $label])
                );
            }

            $allowedPositions = $businessRules['allowed_positions'] ?? null;
            if (is_array($allowedPositions) && in_array('top', $allowedPositions, true)) {
                foreach ($blockTypes as $item) {
                    if ($item['type'] === $blockType && $item['section_index'] !== 0) {
                        $label = $blockConfig['name'] ?? $blockType;
                        throw new RuntimeException(
                            __('page_builder.errors.top_position_only', ['label' => $label])
                        );
                    }
                }
            }
        }
    }
}
