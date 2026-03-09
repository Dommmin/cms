<?php

declare(strict_types=1);

use App\Models\ProductType;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);
});

it('renders product type edit page with productType prop', function () {
    $productType = ProductType::query()->create([
        'name' => 'Apparel',
        'slug' => 'apparel-test',
        'has_variants' => true,
        'variant_selection_attributes' => ['color', 'size'],
        'is_shippable' => true,
    ]);

    $this->get("/admin/ecommerce/product-types/{$productType->id}/edit")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/ecommerce/product-types/edit')
            ->where('productType.id', $productType->id)
            ->where('productType.slug', 'apparel-test')
        );
});

it('updates product type booleans from edit form payload', function () {
    $productType = ProductType::query()->create([
        'name' => 'Accessories',
        'slug' => 'accessories-test',
        'has_variants' => true,
        'variant_selection_attributes' => ['color'],
        'is_shippable' => true,
    ]);

    $this->put("/admin/ecommerce/product-types/{$productType->id}", [
        'name' => 'Accessories Updated',
        'slug' => 'accessories-updated',
        'has_variants' => '0',
        'is_shippable' => '0',
    ])->assertRedirect()
        ->assertSessionHas('success', 'Typ produktu został zaktualizowany');

    $productType->refresh();

    expect($productType->name)->toBe('Accessories Updated')
        ->and($productType->slug)->toBe('accessories-updated')
        ->and($productType->has_variants)->toBeFalse()
        ->and($productType->is_shippable)->toBeFalse();
});
