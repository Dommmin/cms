<?php

declare(strict_types=1);

use App\Models\GlobalSlot;
use App\Models\ReusableBlock;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');

    // Create a dummy reusable block for testing foreign key constraint
    $this->block = ReusableBlock::query()->create([
        'name' => 'Test Badge',
        'type' => 'trust_badges',
        'configuration' => ['badges' => []],
        'relations_config' => [],
        'is_active' => true,
    ]);
});

it('creates a global slot with valid configuration', function (): void {
    $this->actingAs($this->user)
        ->postJson(route('admin.cms.global-slots.store'), [
            'location' => 'announcement_bar',
            'label' => 'Main Announcement Bar',
            'reusable_block_id' => $this->block->id,
            'is_active' => true,
            'settings' => [
                'bg_color' => '#111827',
                'dismissible' => true,
            ],
        ])
        ->assertRedirect();

    $slot = GlobalSlot::query()->firstOrFail();

    expect($slot->location->value)->toBe('announcement_bar')
        ->and($slot->label)->toBe('Main Announcement Bar')
        ->and($slot->reusable_block_id)->toBe($this->block->id)
        ->and($slot->settings['bg_color'])->toBe('#111827');
});

it('rejects global slot creation with invalid location', function (): void {
    $this->actingAs($this->user)
        ->postJson(route('admin.cms.global-slots.store'), [
            'location' => 'invalid_location_name',
            'label' => 'Invalid location',
            'is_active' => true,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['location']);
});

it('updates a global slot', function (): void {
    $slot = GlobalSlot::query()->create([
        'location' => 'trust_bar',
        'label' => 'Trust Badges Slot',
        'reusable_block_id' => $this->block->id,
        'is_active' => true,
        'position' => 0,
        'settings' => ['padding' => 'sm'],
    ]);

    $this->actingAs($this->user)
        ->putJson(route('admin.cms.global-slots.update', $slot), [
            'location' => 'trust_bar',
            'label' => 'Updated Trust Badges Slot',
            'reusable_block_id' => null,
            'configuration' => ['html' => '<div>Inline</div>'],
            'is_active' => false,
            'position' => 1,
            'settings' => ['padding' => 'md'],
        ])
        ->assertRedirect();

    $slot->refresh();

    expect($slot->label)->toBe('Updated Trust Badges Slot')
        ->and($slot->reusable_block_id)->toBeNull()
        ->and($slot->configuration['html'])->toBe('<div>Inline</div>')
        ->and($slot->is_active)->toBeFalse()
        ->and($slot->settings['padding'])->toBe('md');
});

it('toggles global slot active state', function (): void {
    $slot = GlobalSlot::query()->create([
        'location' => 'top_info_bar',
        'label' => 'Top Bar Info',
        'is_active' => true,
        'position' => 0,
    ]);

    $this->actingAs($this->user)
        ->patchJson(route('admin.cms.global-slots.toggle', $slot), [
            'is_active' => false,
        ])
        ->assertRedirect();

    expect($slot->fresh()->is_active)->toBeFalse();
});

it('reorders global slots', function (): void {
    $slot1 = GlobalSlot::query()->create([
        'location' => 'footer_columns',
        'label' => 'Column 1',
        'is_active' => true,
        'position' => 0,
    ]);

    $slot2 = GlobalSlot::query()->create([
        'location' => 'footer_columns',
        'label' => 'Column 2',
        'is_active' => true,
        'position' => 1,
    ]);

    $this->actingAs($this->user)
        ->postJson(route('admin.cms.global-slots.reorder'), [
            'slots' => [
                ['id' => $slot1->id, 'position' => 1],
                ['id' => $slot2->id, 'position' => 0],
            ],
        ])
        ->assertOk();

    expect($slot1->fresh()->position)->toBe(1)
        ->and($slot2->fresh()->position)->toBe(0);
});

it('deletes a global slot', function (): void {
    $slot = GlobalSlot::query()->create([
        'location' => 'sticky_cta',
        'label' => 'Floating Sticky CTA',
        'is_active' => true,
        'position' => 0,
    ]);

    $this->actingAs($this->user)
        ->deleteJson(route('admin.cms.global-slots.destroy', $slot))
        ->assertRedirect();

    expect(GlobalSlot::query()->where('id', $slot->id)->exists())->toBeFalse();
});
