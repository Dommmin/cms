<?php

declare(strict_types=1);

use App\Models\ReusableBlock;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
});

it('rejects reusable block configuration outside the block schema', function (): void {
    $this->actingAs($this->user)
        ->postJson(route('admin.cms.reusable-blocks.store'), [
            'name' => 'Reusable rich text',
            'type' => 'rich_text',
            'configuration' => [
                'content' => '<p>Safe content</p>',
                'max_width' => 'medium',
                'unknown' => 'value',
            ],
            'relations_config' => [],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['configuration.unknown']);
});

it('sanitizes reusable block rich text before saving', function (): void {
    $this->actingAs($this->user)
        ->postJson(route('admin.cms.reusable-blocks.store'), [
            'name' => 'Reusable rich text',
            'type' => 'rich_text',
            'configuration' => [
                'content' => '<p>Hello</p><script>alert("xss")</script>',
                'max_width' => 'medium',
            ],
            'relations_config' => [],
        ])
        ->assertCreated();

    $block = ReusableBlock::query()->firstOrFail();

    expect($block->configuration['content'])->toContain('Hello')
        ->and($block->configuration['content'])->not->toContain('<script');
});

it('validates reusable block updates with the block schema', function (): void {
    $block = ReusableBlock::query()->create([
        'name' => 'Reusable rich text',
        'description' => null,
        'type' => 'rich_text',
        'configuration' => ['content' => '<p>Old</p>', 'max_width' => 'medium'],
        'relations_config' => [],
        'is_active' => true,
    ]);

    $this->actingAs($this->user)
        ->putJson(route('admin.cms.reusable-blocks.update', $block), [
            'name' => 'Reusable rich text',
            'description' => null,
            'configuration' => [
                'content' => '<p>Updated</p>',
                'max_width' => 'invalid',
            ],
            'relations_config' => [],
            'is_active' => true,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['configuration.max_width']);
});
