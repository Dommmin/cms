<?php

declare(strict_types=1);

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'editor']);
});

// ─── Index ────────────────────────────────────────────────────────────────────

test('guest cannot access menus index', function () {
    $this->get('/admin/menus')->assertNotFound();
});

test('admin can access menus index', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get('/admin/menus')
        ->assertOk()
        ->assertInertia(fn ($assert) => $assert->component('admin/menus/index'));
});

// ─── Create / Store ───────────────────────────────────────────────────────────

test('admin can create a menu', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->post('/admin/menus', [
            'name' => 'Main Navigation',
            'location' => null,
            'is_active' => true,
        ])
        ->assertRedirect();

    expect(Menu::where('name', 'Main Navigation')->exists())->toBeTrue();
});

test('menu name is required', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->post('/admin/menus', ['name' => '', 'location' => null])
        ->assertSessionHasErrors('name');
});

// ─── Edit ─────────────────────────────────────────────────────────────────────

test('admin can access menu edit page with serialized items', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $menu = Menu::create(['name' => 'Test Menu', 'location' => null, 'is_active' => true]);
    $item = MenuItem::create([
        'menu_id' => $menu->id,
        'parent_id' => null,
        'label' => 'Home',
        'url' => '/',
        'target' => '_self',
        'icon' => null,
        'is_active' => true,
        'position' => 0,
    ]);

    $this->actingAs($user)
        ->get("/admin/menus/{$menu->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($assert) => $assert
            ->component('admin/menus/edit')
            ->has('menu')
            ->has('locations')
            ->where('menu.id', $menu->id)
            ->where('menu.name', 'Test Menu')
            ->has('menu.items', 1)
            ->where('menu.items.0.label', 'Home')
        );
});

// ─── Update ───────────────────────────────────────────────────────────────────

test('admin can update menu settings', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $menu = Menu::create(['name' => 'Old Name', 'location' => null, 'is_active' => true]);

    $this->actingAs($user)
        ->put("/admin/menus/{$menu->id}", [
            'name' => 'New Name',
            'location' => null,
            'is_active' => false,
            'items' => [],
        ])
        ->assertRedirect();

    expect($menu->fresh()->name)->toBe('New Name');
    expect($menu->fresh()->is_active)->toBeFalse();
});

test('updating menu syncs items tree', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $menu = Menu::create(['name' => 'Nav', 'location' => null, 'is_active' => true]);

    // Seed an old item that should be deleted
    MenuItem::create([
        'menu_id' => $menu->id,
        'parent_id' => null,
        'label' => 'Old Item',
        'url' => '/old',
        'target' => '_self',
        'icon' => null,
        'is_active' => true,
        'position' => 0,
    ]);

    $this->actingAs($user)
        ->put("/admin/menus/{$menu->id}", [
            'name' => 'Nav',
            'location' => null,
            'is_active' => true,
            'items' => [
                [
                    'label' => ['en' => 'Home'],
                    'url' => '/',
                    'target' => '_self',
                    'icon' => null,
                    'children' => [],
                ],
                [
                    'label' => ['en' => 'About'],
                    'url' => '/about',
                    'target' => '_self',
                    'icon' => null,
                    'children' => [
                        [
                            'label' => ['en' => 'Team'],
                            'url' => '/about/team',
                            'target' => '_self',
                            'icon' => null,
                        ],
                    ],
                ],
            ],
        ])
        ->assertRedirect();

    $topItems = MenuItem::where('menu_id', $menu->id)->whereNull('parent_id')->orderBy('position')->get();

    expect($topItems)->toHaveCount(2);
    expect($topItems[0]->getLocalizedLabel('en'))->toBe('Home');
    expect($topItems[1]->getLocalizedLabel('en'))->toBe('About');

    $childItems = MenuItem::where('menu_id', $menu->id)->whereNotNull('parent_id')->get();
    expect($childItems)->toHaveCount(1);
    expect($childItems[0]->getLocalizedLabel('en'))->toBe('Team');
    expect($childItems[0]->parent_id)->toBe($topItems[1]->id);
});

test('item label is required when updating menu', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $menu = Menu::create(['name' => 'Nav', 'location' => null, 'is_active' => true]);

    $this->actingAs($user)
        ->put("/admin/menus/{$menu->id}", [
            'name' => 'Nav',
            'location' => null,
            'is_active' => true,
            'items' => [
                ['label' => ['en' => ''], 'url' => '/', 'target' => '_self', 'icon' => null, 'children' => []],
            ],
        ])
        ->assertSessionHasErrors('items.0.label.en');
});

// ─── Destroy ──────────────────────────────────────────────────────────────────

test('admin can delete a menu and its items', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $menu = Menu::create(['name' => 'To Delete', 'location' => null, 'is_active' => true]);
    MenuItem::create([
        'menu_id' => $menu->id,
        'parent_id' => null,
        'label' => 'Item',
        'url' => '/',
        'target' => '_self',
        'icon' => null,
        'is_active' => true,
        'position' => 0,
    ]);

    $this->actingAs($user)
        ->delete("/admin/menus/{$menu->id}")
        ->assertRedirect();

    expect(Menu::find($menu->id))->toBeNull();
    expect(MenuItem::where('menu_id', $menu->id)->count())->toBe(0);
});
