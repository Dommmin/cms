<?php

declare(strict_types=1);

use App\Models\Store;

it('returns only active stores on the index endpoint', function () {
    Store::factory()->create(['is_active' => true, 'name' => 'Active Store']);
    Store::factory()->create(['is_active' => false, 'name' => 'Inactive Store']);

    $response = $this->getJson('/api/v1/stores');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Active Store');
});

it('returns store json structure', function () {
    $store = Store::factory()->create(['is_active' => true]);

    $response = $this->getJson('/api/v1/stores');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'address', 'city', 'country', 'lat', 'lng'],
            ],
        ]);
});

it('returns a single active store', function () {
    $store = Store::factory()->create(['is_active' => true]);

    $response = $this->getJson("/api/v1/stores/{$store->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $store->id)
        ->assertJsonPath('data.name', $store->name);
});

it('returns 404 for an inactive store', function () {
    $store = Store::factory()->create(['is_active' => false]);

    $response = $this->getJson("/api/v1/stores/{$store->id}");

    $response->assertNotFound();
});
