<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Page;
use RuntimeException;

class PageBuilderRulesService
{
    /**
     * Enforce business rules from config (cms.sections.*.business_rules).
     */
    public function enforce(Page $page): void
    {
        $snapshot = $page->builder_snapshot;
        if (! is_array($snapshot)) {
            return;
        }

        $blockTypes = [];
        foreach (($snapshot['sections'] ?? []) as $sectionIndex => $section) {
            foreach (($section['blocks'] ?? []) as $block) {
                if (isset($block['type'])) {
                    $blockTypes[] = [
                        'type' => $block['type'],
                        'section_index' => $sectionIndex,
                    ];
                }
            }
        }

        $counts = [];
        foreach ($blockTypes as $item) {
            $type = $item['type'];
            $counts[$type] = ($counts[$type] ?? 0) + 1;
        }

        $sectionsConfig = config('cms.sections', []);
        foreach ($counts as $blockType => $count) {
            $businessRules = $sectionsConfig[$blockType]['business_rules'] ?? null;
            if (! is_array($businessRules)) {
                continue;
            }

            $maxPerPage = $businessRules['max_per_page'] ?? null;
            if ($maxPerPage !== null && $count > $maxPerPage) {
                $label = $sectionsConfig[$blockType]['label'] ?? $blockType;
                throw new RuntimeException(
                    sprintf('Na stronie może być co najwyżej %s blok(ów) „%s', $maxPerPage, $label).'.'
                );
            }

            $allowedPositions = $businessRules['allowed_positions'] ?? null;
            if (is_array($allowedPositions) && in_array('top', $allowedPositions, true)) {
                foreach ($blockTypes as $item) {
                    if ($item['type'] === $blockType && $item['section_index'] !== 0) {
                        $label = $sectionsConfig[$blockType]['label'] ?? $blockType;
                        throw new RuntimeException(
                            'Blok „'.$label.' może znajdować się tylko na górze strony (pierwsza sekcja).'
                        );
                    }
                }
            }
        }
    }
}
