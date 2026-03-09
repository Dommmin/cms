<?php

declare(strict_types=1);

use App\Models\Page;
use App\Services\PageBuilderSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('syncs page builder snapshot into sections and blocks', function () {
    $this->markTestSkipped('DB not configured for unit tests in this environment');
    $page = Page::create([
        'title' => 'Test Page',
        'slug' => 'test-page',
        'layout' => 'default',
        'page_type' => 'blocks',
        'is_published' => false,
        'position' => 0,
    ]);
    $snapshot = [
        'sections' => [
            [
                'section_type' => 'hero',
                'layout' => 'default',
                'variant' => null,
                'settings' => [],
                'position' => 0,
                'is_active' => true,
                'blocks' => [
                    [
                        'type' => 'image',
                        'configuration' => ['src' => '/img.png'],
                        'position' => 0,
                        'is_active' => true,
                    ],
                ],
            ],
        ],
    ];

    $service = new PageBuilderSyncService;
    $service->sync($page, $snapshot);

    // skipped
});
