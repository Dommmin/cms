<?php

declare(strict_types=1);

use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
    $this->actingAs($this->user);
});

it('can_update_builder_via_snapshot_live_edit', function () {
    $page = Page::factory()->create();
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
                        'type' => 'hero_banner',
                        'configuration' => ['src' => '/img.png'],
                        'position' => 0,
                        'is_active' => true,
                    ],
                ],
            ],
        ],
    ];

    $response = $this->put("/admin/cms/pages/{$page->id}/builder", ['snapshot' => $snapshot]);

    $response->assertRedirect();

    $page->refresh();
    expect($page->allSections()->count())->toBe(1);
    expect($page->allBlocks()->count())->toBe(1);
});

it('can_update_builder_with_sections_payload', function () {
    $page = Page::factory()->create();
    $sections = [
        [
            'section_type' => 'text',
            'layout' => 'default',
            'settings' => [],
            'position' => 0,
            'is_active' => true,
            'blocks' => [
                [
                    'type' => 'rich_text',
                    'configuration' => ['text' => 'Hello'],
                    'position' => 0,
                    'is_active' => true,
                ],
            ],
        ],
    ];

    $response = $this->put("/admin/cms/pages/{$page->id}/builder", ['sections' => $sections]);

    $response->assertRedirect();

    $page->refresh();
    expect($page->allSections()->count())->toBe(1);
    expect($page->allBlocks()->count())->toBe(1);
});
