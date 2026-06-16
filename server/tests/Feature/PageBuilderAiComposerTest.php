<?php

declare(strict_types=1);

use App\Models\Page;
use App\Models\PageVersion;
use App\Models\User;
use App\Services\PageBuilder\PageBuilderAiComposerService;

it('composes a valid AI snapshot and records source as ai', function (): void {
    $user = User::factory()->create();
    $page = Page::factory()->create(['version' => 0]);

    $snapshot = [
        'sections' => [
            [
                'section_type' => 'standard',
                'layout' => 'contained',
                'variant' => 'light',
                'is_active' => true,
                'blocks' => [
                    [
                        'type' => 'rich_text',
                        'configuration' => [
                            'content' => '<p>AI generated</p>',
                            'max_width' => 'medium',
                        ],
                        'is_active' => true,
                        'relations' => [],
                    ],
                ],
            ],
        ],
    ];

    $composed = resolve(PageBuilderAiComposerService::class)->compose($page, $snapshot, $user);

    expect($composed->builder_snapshot)->toBeArray()
        ->and($composed->sections)->not->toBeEmpty();

    $version = PageVersion::query()
        ->where('page_id', $page->id)
        ->where('source', 'ai')
        ->first();

    expect($version)->not->toBeNull();
});
