<?php

declare(strict_types=1);

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Permission::query()->firstOrCreate(['name' => 'pages.edit', 'guard_name' => 'web']);
    Permission::query()->firstOrCreate(['name' => 'cms.custom_html.manage', 'guard_name' => 'web']);

    Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::query()->firstOrCreate(['name' => 'editor', 'guard_name' => 'web'])
        ->syncPermissions(['pages.edit']);

    $this->page = Page::factory()->create(['version' => 0]);
});

function customHtmlSnapshot(array $configuration): array
{
    return [
        'sections' => [
            [
                'section_type' => 'standard',
                'layout' => 'contained',
                'variant' => 'light',
                'is_active' => true,
                'blocks' => [
                    [
                        'type' => 'custom_html',
                        'configuration' => $configuration,
                        'is_active' => true,
                        'relations' => [],
                    ],
                ],
            ],
        ],
    ];
}

it('sanitizes custom HTML before saving', function (): void {
    $user = User::factory()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => customHtmlSnapshot([
                'html' => '<div>Safe</div><script>alert("xss")</script>',
                'css' => '.safe { color: red; }',
            ]),
        ])
        ->assertRedirect();

    $configuration = PageBlock::query()->firstOrFail()->configuration;

    expect($configuration['html'])->toContain('Safe')
        ->and($configuration['html'])->not->toContain('<script');
});

it('sanitizes dangerous custom CSS before saving', function (): void {
    $user = User::factory()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => customHtmlSnapshot([
                'html' => '<div>Safe</div>',
                'css' => '@import url("https://evil.test/x.css"); .x { background: url(javascript:alert(1)); width: expression(alert(1)); } </style>',
            ]),
        ])
        ->assertRedirect();

    $css = PageBlock::query()->firstOrFail()->configuration['css'];

    expect($css)->not->toContain('@import')
        ->and($css)->not->toContain('javascript:')
        ->and($css)->not->toContain('expression')
        ->and($css)->not->toContain('</style');
});

it('rejects custom HTML blocks for users without custom HTML permission', function (): void {
    $user = User::factory()->create();
    $user->assignRole('editor');

    $this->actingAs($user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => customHtmlSnapshot([
                'html' => '<div>Safe</div>',
                'css' => '.safe { color: red; }',
            ]),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['snapshot.sections.0.blocks.0.configuration']);

    expect(PageBlock::query()->where('page_id', $this->page->id)->count())->toBe(0);
});

it('rejects custom HTML blocks when custom HTML is disabled', function (): void {
    config()->set('blocks.custom_html_enabled', false);

    $user = User::factory()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => customHtmlSnapshot([
                'html' => '<div>Safe</div>',
                'css' => '.safe { color: red; }',
            ]),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['snapshot.sections.0.blocks.0.configuration']);

    expect(PageBlock::query()->where('page_id', $this->page->id)->count())->toBe(0);
});
