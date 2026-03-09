<?php

declare(strict_types=1);

use App\Models\Currency;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
    $this->actingAs($this->user);
});

it('displays currencies index page', function () {
    $currencies = Currency::factory()->count(3)->create();

    $response = $this->get('/admin/currencies');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/currencies/index')
            ->has('currencies.data', 3)
        );
});

it('displays currency create page', function () {
    $response = $this->get('/admin/currencies/create');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/currencies/create')
        );
});

it('stores a new currency', function () {
    $data = [
        'code' => 'USD',
        'name' => 'US Dollar',
        'symbol' => '$',
        'decimal_places' => 2,
        'is_active' => true,
        'is_base' => false,
    ];

    $response = $this->post('/admin/currencies', $data);

    $response->assertRedirect('/admin/currencies')
        ->assertSessionHas('success', 'Waluta została utworzona');

    $this->assertDatabaseHas('currencies', [
        'code' => 'USD',
        'name' => 'US Dollar',
        'symbol' => '$',
        'decimal_places' => 2,
        'is_active' => true,
        'is_base' => false,
    ]);
});

it('stores a new base currency and unsets previous base', function () {
    $existingBase = Currency::factory()->create(['code' => 'USD', 'is_base' => true]);

    $data = [
        'code' => 'EUR',
        'name' => 'Euro',
        'symbol' => '€',
        'decimal_places' => 2,
        'is_active' => true,
        'is_base' => true,
    ];

    $response = $this->post('/admin/currencies', $data);

    $response->assertRedirect('/admin/currencies');

    $this->assertDatabaseHas('currencies', [
        'code' => 'EUR',
        'is_base' => true,
    ]);

    $this->assertDatabaseHas('currencies', [
        'id' => $existingBase->id,
        'is_base' => false,
    ]);
});

it('displays currency edit page', function () {
    $currency = Currency::factory()->create();

    $response = $this->get("/admin/currencies/{$currency->id}/edit");

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/currencies/edit')
            ->where('currency.id', $currency->id)
        );
});

it('updates an existing currency', function () {
    $currency = Currency::factory()->create();

    $data = [
        'code' => 'GBP',
        'name' => 'British Pound',
        'symbol' => '£',
        'decimal_places' => 2,
        'is_active' => false,
        'is_base' => false,
    ];

    $response = $this->put("/admin/currencies/{$currency->id}", $data);

    $response->assertRedirect()->assertSessionHas('success', 'Waluta została zaktualizowana');

    $this->assertDatabaseHas('currencies', [
        'id' => $currency->id,
        'code' => 'GBP',
        'name' => 'British Pound',
        'symbol' => '£',
        'is_active' => false,
    ]);
});

it('prevents deletion of base currency', function () {
    $currency = Currency::factory()->create(['is_base' => true]);

    $response = $this->delete("/admin/currencies/{$currency->id}");

    $response->assertRedirect()->assertSessionHas('error', 'Nie można usunąć waluty bazowej');

    $this->assertDatabaseHas('currencies', ['id' => $currency->id]);
});

it('deletes a non-base currency', function () {
    $currency = Currency::factory()->create(['is_base' => false]);

    $response = $this->delete("/admin/currencies/{$currency->id}");

    $response->assertRedirect()->assertSessionHas('success', 'Waluta została usunięta');

    $this->assertDatabaseMissing('currencies', ['id' => $currency->id]);
});
