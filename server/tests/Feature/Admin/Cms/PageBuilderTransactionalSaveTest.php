<?php

declare(strict_types=1);

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use App\Models\PageVersion;
use App\Models\User;
use App\Services\PageBuilderSyncService;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');

    $this->page = Page::factory()->create(['version' => 0]);
});

function transactionalSnapshot(string $content = '<p>Saved</p>'): array
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
                        'type' => 'rich_text',
                        'configuration' => [
                            'content' => $content,
                            'max_width' => 'medium',
                        ],
                        'is_active' => true,
                        'relations' => [],
                    ],
                ],
            ],
        ],
    ];
}

it('increments version and creates a manual page version after manual save', function (): void {
    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'expected_version' => 0,
            'snapshot' => transactionalSnapshot(),
        ])
        ->assertRedirect();

    $version = PageVersion::query()->where('page_id', $this->page->id)->firstOrFail();

    expect($this->page->fresh()->version)->toBe(1)
        ->and($version->is_autosave)->toBeFalse()
        ->and($version->source)->toBe('manual')
        ->and($version->change_note)->toBe('Manual builder save');
});

it('increments version and creates an autosave page version after autosave', function (): void {
    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.autosave', $this->page), [
            'expected_version' => 0,
            'snapshot' => transactionalSnapshot(),
        ])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('version', 1);

    $version = PageVersion::query()->where('page_id', $this->page->id)->firstOrFail();

    expect($this->page->fresh()->version)->toBe(1)
        ->and($version->is_autosave)->toBeTrue()
        ->and($version->source)->toBe('autosave')
        ->and($version->change_note)->toBe('Autosave');
});

it('returns conflict when expected version is stale', function (): void {
    $this->page->forceFill(['version' => 3])->save();

    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'expected_version' => 2,
            'snapshot' => transactionalSnapshot(),
        ])
        ->assertConflict()
        ->assertJsonPath('current_version', 3);

    expect(PageVersion::query()->where('page_id', $this->page->id)->count())->toBe(0)
        ->and(PageBlock::query()->where('page_id', $this->page->id)->count())->toBe(0);
});

it('rolls back deleted sections when sync fails', function (): void {
    $section = PageSection::query()->create([
        'page_id' => $this->page->id,
        'section_type' => 'standard',
        'layout' => 'contained',
        'variant' => 'light',
        'position' => 0,
        'is_active' => true,
    ]);

    PageBlock::query()->create([
        'page_id' => $this->page->id,
        'section_id' => $section->id,
        'type' => 'rich_text',
        'configuration' => ['content' => '<p>Existing</p>', 'max_width' => 'medium'],
        'position' => 0,
        'is_active' => true,
    ]);

    app()->instance(PageBuilderSyncService::class, new class extends PageBuilderSyncService
    {
        public function sync(Page $page, array $snapshot): void
        {
            $page->allBlocks()->delete();
            $page->allSections()->delete();

            throw new RuntimeException('Forced sync failure');
        }
    });

    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'expected_version' => 0,
            'snapshot' => transactionalSnapshot(),
        ])
        ->assertServerError();

    expect(PageSection::query()->where('page_id', $this->page->id)->count())->toBe(1)
        ->and(PageBlock::query()->where('page_id', $this->page->id)->count())->toBe(1)
        ->and($this->page->fresh()->version)->toBe(0);
});

it('imports transactionally and creates an import page version', function (): void {
    $file = UploadedFile::fake()->createWithContent(
        'page.json',
        (string) json_encode([
            'sections' => transactionalSnapshot('<p>Imported</p>')['sections'],
        ]),
    );

    $this->actingAs($this->user)
        ->post(route('admin.cms.pages.builder.import', $this->page), [
            'file' => $file,
        ])
        ->assertRedirect();

    $version = PageVersion::query()->where('page_id', $this->page->id)->firstOrFail();

    expect($this->page->fresh()->version)->toBe(1)
        ->and($version->is_autosave)->toBeFalse()
        ->and($version->source)->toBe('import')
        ->and($version->change_note)->toBe('Builder import')
        ->and(PageBlock::query()->where('page_id', $this->page->id)->firstOrFail()->configuration['content'])->toContain('Imported');
});
