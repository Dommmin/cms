<?php

declare(strict_types=1);

use App\Models\SectionTemplate;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
});

function sectionTemplatePayload(array $blockOverrides = []): array
{
    return [
        'name' => 'Hero template',
        'description' => null,
        'category' => 'landing',
        'is_global' => false,
        'snapshot' => [
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
                                'content' => '<p>Template content</p>',
                                'max_width' => 'medium',
                            ],
                            'is_active' => true,
                            'relations' => [],
                        ], $blockOverrides),
                    ],
                ],
            ],
        ],
    ];
}

it('rejects invalid section template snapshots', function (): void {
    $this->actingAs($this->user)
        ->postJson(route('admin.cms.section-templates.store'), sectionTemplatePayload([
            'configuration' => [
                'content' => '<p>Template content</p>',
                'max_width' => 'medium',
                'unexpected' => 'value',
            ],
        ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['snapshot.sections.0.blocks.0.configuration.unexpected']);
});

it('sanitizes section template rich text snapshots', function (): void {
    $this->actingAs($this->user)
        ->postJson(route('admin.cms.section-templates.store'), sectionTemplatePayload([
            'configuration' => [
                'content' => '<p>Hello</p><script>alert("xss")</script>',
                'max_width' => 'medium',
            ],
        ]))
        ->assertCreated();

    $template = SectionTemplate::query()->firstOrFail();

    expect($template->snapshot['sections'][0]['blocks'][0]['configuration']['content'])->toContain('Hello')
        ->and($template->snapshot['sections'][0]['blocks'][0]['configuration']['content'])->not->toContain('<script');
});
