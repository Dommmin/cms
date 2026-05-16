<?php

declare(strict_types=1);

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');

    $this->page = Page::factory()->create(['version' => 0]);
});

function pageBuilderSnapshot(array $blockOverrides = []): array
{
    return [
        'sections' => [
            [
                'section_type' => 'standard',
                'layout' => 'contained',
                'variant' => 'light',
                'is_active' => true,
                'blocks' => [
                    array_replace([
                        'type' => 'rich_text',
                        'configuration' => [
                            'content' => '<p>Safe content</p>',
                            'max_width' => 'medium',
                        ],
                        'is_active' => true,
                        'relations' => [],
                    ], $blockOverrides),
                ],
            ],
        ],
    ];
}

it('rejects unknown block types', function (): void {
    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => pageBuilderSnapshot(['type' => 'missing_block']),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['snapshot.sections.0.blocks.0.type']);
});

it('rejects unknown configuration fields', function (): void {
    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => pageBuilderSnapshot([
                'configuration' => [
                    'content' => '<p>Safe content</p>',
                    'max_width' => 'medium',
                    'unexpected' => 'value',
                ],
            ]),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['snapshot.sections.0.blocks.0.configuration.unexpected']);
});

it('rejects wrong configuration field types', function (): void {
    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => pageBuilderSnapshot([
                'type' => 'featured_products',
                'configuration' => [
                    'filter_mode' => 'manual',
                    'max_items' => 'eight',
                ],
            ]),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['snapshot.sections.0.blocks.0.configuration.max_items']);
});

it('rejects enum values outside the block schema', function (): void {
    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => pageBuilderSnapshot([
                'configuration' => [
                    'content' => '<p>Safe content</p>',
                    'max_width' => 'enormous',
                ],
            ]),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['snapshot.sections.0.blocks.0.configuration.max_width']);
});

it('rejects relations that are not allowed for the block', function (): void {
    $product = Product::factory()->create();

    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => pageBuilderSnapshot([
                'relations' => [
                    [
                        'relation_type' => 'product',
                        'relation_id' => $product->id,
                        'relation_key' => 'products',
                        'position' => 0,
                        'metadata' => null,
                    ],
                ],
            ]),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['snapshot.sections.0.blocks.0.relations.0.relation_key']);
});

it('rejects missing relation models', function (): void {
    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => pageBuilderSnapshot([
                'type' => 'featured_products',
                'configuration' => ['filter_mode' => 'manual'],
                'relations' => [
                    [
                        'relation_type' => 'product',
                        'relation_id' => 999999,
                        'relation_key' => 'products',
                        'position' => 0,
                        'metadata' => null,
                    ],
                ],
            ]),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['snapshot.sections.0.blocks.0.relations.0.relation_id']);
});

it('sanitizes rich text configuration before syncing', function (): void {
    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => pageBuilderSnapshot([
                'configuration' => [
                    'content' => '<p>Hello</p><script>alert("xss")</script>',
                    'max_width' => 'medium',
                ],
            ]),
        ])
        ->assertRedirect();

    $configuration = PageBlock::query()->firstOrFail()->configuration;

    expect($configuration['content'])->toContain('Hello')
        ->and($configuration['content'])->not->toContain('<script');
});

it('sanitizes nested rich text in repeaters', function (): void {
    $this->actingAs($this->user)
        ->putJson(route('admin.cms.pages.builder.update', $this->page), [
            'snapshot' => pageBuilderSnapshot([
                'type' => 'tabs',
                'configuration' => [
                    'tabs' => [
                        [
                            'title' => 'Details',
                            'content' => '<p>Nested</p><script>alert("xss")</script>',
                        ],
                    ],
                ],
            ]),
        ])
        ->assertRedirect();

    $configuration = PageBlock::query()->firstOrFail()->configuration;

    expect($configuration['tabs'][0]['content'])->toContain('Nested')
        ->and($configuration['tabs'][0]['content'])->not->toContain('<script');
});

it('validates imported JSON through the same snapshot rules', function (): void {
    $file = UploadedFile::fake()->createWithContent(
        'page.json',
        (string) json_encode([
            'sections' => pageBuilderSnapshot([
                'configuration' => [
                    'content' => '<p>Safe content</p>',
                    'max_width' => 'medium',
                    'unexpected' => 'value',
                ],
            ])['sections'],
        ]),
    );

    $this->actingAs($this->user)
        ->post(route('admin.cms.pages.builder.import', $this->page), [
            'file' => $file,
        ])
        ->assertSessionHasErrors(['snapshot.sections.0.blocks.0.configuration.unexpected']);
});
