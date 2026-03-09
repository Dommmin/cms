<?php

declare(strict_types=1);

/**
 * Section Types
 *
 * Sections are structural containers that wrap blocks on a page.
 * They control the layout, width, and visual style of the container —
 * NOT the content inside. Content is defined by the blocks within a section.
 *
 * These values are passed to the frontend renderer (theme layer).
 * They do not affect how the admin builder looks — only how the public
 * site renders the container around the blocks.
 */
return [
    'standard' => [
        'label' => 'Standard Section',
        'description' => 'Default content container with max-width and standard padding.',
        'layouts' => [
            'contained' => 'Contained (centered, max-width)',
            'full-width' => 'Full Width',
            'flush' => 'Flush (no padding)',
        ],
        'variants' => [
            'light' => 'Light Background',
            'dark' => 'Dark Background',
            'muted' => 'Muted / Gray',
            'brand' => 'Brand Color',
        ],
    ],

    'hero' => [
        'label' => 'Hero Section',
        'description' => 'Tall, prominent section typically placed at the top of a page.',
        'layouts' => [
            'full-width' => 'Full Width',
            'contained' => 'Contained',
        ],
        'variants' => [
            'centered' => 'Content Centered',
            'left-aligned' => 'Content Left',
            'split' => 'Content + Image (split)',
        ],
    ],

    'banner' => [
        'label' => 'Banner / Announcement',
        'description' => 'Highlighted strip for promotions or important announcements.',
        'layouts' => [
            'full-width' => 'Full Width',
            'contained' => 'Contained',
        ],
        'variants' => [
            'solid' => 'Solid Color',
            'gradient' => 'Gradient',
            'outlined' => 'Outlined',
        ],
    ],

    'split' => [
        'label' => 'Split Layout',
        'description' => 'Two-column section-level split. Use Two Columns block inside for content.',
        'layouts' => [
            '50-50' => '50 / 50',
            '60-40' => '60 / 40',
            '40-60' => '40 / 60',
            '70-30' => '70 / 30',
        ],
    ],
];
