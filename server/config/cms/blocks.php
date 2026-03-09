<?php

declare(strict_types=1);

/**
 * Block type registry: type => label. Source: config('cms.sections').
 * Used for "where used" and block type lists. Keys must match PageBlockTypeEnum and DB.
 */
return collect(config('cms.sections', []))
    ->map(fn (array $def): string => $def['label'] ?? '')
    ->filter()
    ->all();
