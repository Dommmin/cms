<?php

declare(strict_types=1);

use App\Models\Theme;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);
});

it('activates only one theme at a time when creating an active theme', function () {
    Theme::query()->create([
        'name' => 'Theme One',
        'slug' => 'theme-one',
        'is_active' => true,
    ]);

    $this->post('/admin/themes', [
        'name' => 'Theme Two',
        'slug' => 'theme-two',
        'is_active' => '1',
    ])->assertRedirect('/admin/themes')
        ->assertSessionHas('success', 'Motyw został utworzony');

    expect(Theme::query()->where('is_active', true)->count())->toBe(1)
        ->and(Theme::query()->where('slug', 'theme-two')->value('is_active'))->toBeTrue();
});

it('shares active theme tokens in inertia shared props', function () {
    Theme::query()->create([
        'name' => 'Theme One',
        'slug' => 'theme-one-shared',
        'tokens' => [
            'background' => 'oklch(0.98 0 0)',
            'primary' => '#111827',
        ],
        'is_active' => true,
    ]);

    $this->get('/admin/themes')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/themes/index')
            ->where('activeTheme.slug', 'theme-one-shared')
            ->where('activeTheme.tokens.background', 'oklch(0.98 0 0)')
            ->where('activeTheme.tokens.primary', '#111827')
        );
});

it('deactivates other themes when updating theme to active', function () {
    $activeTheme = Theme::query()->create([
        'name' => 'Active Theme',
        'slug' => 'active-theme',
        'is_active' => true,
    ]);

    $inactiveTheme = Theme::query()->create([
        'name' => 'Inactive Theme',
        'slug' => 'inactive-theme',
        'is_active' => false,
    ]);

    $this->put("/admin/themes/{$inactiveTheme->id}", [
        'name' => $inactiveTheme->name,
        'slug' => $inactiveTheme->slug,
        'description' => '',
        'is_active' => '1',
    ])->assertRedirect()
        ->assertSessionHas('success', 'Motyw został zaktualizowany');

    expect($inactiveTheme->fresh()->is_active)->toBeTrue()
        ->and($activeTheme->fresh()->is_active)->toBeFalse();
});

it('disables custom theme and falls back to base style', function () {
    Theme::query()->create([
        'name' => 'Active Theme',
        'slug' => 'active-theme-to-disable',
        'is_active' => true,
    ]);

    $this->post('/admin/themes/disable')
        ->assertRedirect()
        ->assertSessionHas('success', 'Niestandardowy motyw został wyłączony');

    expect(Theme::query()->where('is_active', true)->count())->toBe(0);
});
