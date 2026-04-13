<?php

declare(strict_types=1);

use App\Models\ShippingMethod;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
});

// ── Store ─────────────────────────────────────────────────────────────────────

it('creates a shipping method with estimated_days_min and max', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.ecommerce.shipping-methods.store'), [
            'carrier' => 'dpd',
            'name' => ['en' => 'DPD Standard'],
            'is_active' => true,
            'base_price' => 999,
            'price_per_kg' => 0,
            'estimated_days_min' => 1,
            'estimated_days_max' => 3,
        ])
        ->assertRedirect();

    $method = ShippingMethod::query()->where('base_price', 999)->first();
    expect($method)->not->toBeNull();
    expect($method->estimated_days_min)->toBe(1);
    expect($method->estimated_days_max)->toBe(3);
});

it('creates a shipping method with dimension constraints', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.ecommerce.shipping-methods.store'), [
            'carrier' => 'dpd',
            'name' => ['en' => 'DPD Parcel'],
            'is_active' => true,
            'base_price' => 1499,
            'price_per_kg' => 0,
            'max_length_cm' => 120,
            'max_width_cm' => 60,
            'max_depth_cm' => 60,
        ])
        ->assertRedirect();

    $method = ShippingMethod::query()->where('base_price', 1499)->first();
    expect($method)->not->toBeNull();
    expect($method->max_length_cm)->toBe(120);
    expect($method->max_width_cm)->toBe(60);
    expect($method->max_depth_cm)->toBe(60);
});

it('service flags default to false when not provided', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.ecommerce.shipping-methods.store'), [
            'carrier' => 'dhl',
            'name' => ['en' => 'DHL Express'],
            'is_active' => true,
            'base_price' => 2999,
            'price_per_kg' => 0,
        ])
        ->assertRedirect();

    $method = ShippingMethod::query()->where('base_price', 2999)->first();
    expect($method)->not->toBeNull();
    expect($method->requires_signature)->toBeFalse();
    expect($method->insurance_available)->toBeFalse();
});

it('creates a shipping method with service flags enabled', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.ecommerce.shipping-methods.store'), [
            'carrier' => 'dhl',
            'name' => ['en' => 'DHL Premium'],
            'is_active' => true,
            'base_price' => 3999,
            'price_per_kg' => 0,
            'requires_signature' => true,
            'insurance_available' => true,
        ])
        ->assertRedirect();

    $method = ShippingMethod::query()->where('base_price', 3999)->first();
    expect($method)->not->toBeNull();
    expect($method->requires_signature)->toBeTrue();
    expect($method->insurance_available)->toBeTrue();
});

// ── Update ────────────────────────────────────────────────────────────────────

it('updates a shipping method with dimension and delivery fields', function (): void {
    $method = ShippingMethod::query()->create([
        'carrier' => 'dpd',
        'name' => ['en' => 'DPD Old'],
        'is_active' => true,
        'base_price' => 799,
        'price_per_kg' => 0,
        'max_weight' => 30,
    ]);

    $this->actingAs($this->user)
        ->put(route('admin.ecommerce.shipping-methods.update', $method), [
            'carrier' => 'dpd',
            'name' => ['en' => 'DPD Updated'],
            'is_active' => true,
            'base_price' => 799,
            'price_per_kg' => 0,
            'estimated_days_min' => 2,
            'estimated_days_max' => 4,
            'max_length_cm' => 80,
            'max_width_cm' => 50,
            'max_depth_cm' => 50,
            'requires_signature' => false,
            'insurance_available' => true,
        ])
        ->assertRedirect();

    $method->refresh();
    expect($method->estimated_days_min)->toBe(2);
    expect($method->estimated_days_max)->toBe(4);
    expect($method->max_length_cm)->toBe(80);
    expect($method->max_width_cm)->toBe(50);
    expect($method->max_depth_cm)->toBe(50);
    expect($method->insurance_available)->toBeTrue();
});

// ── Validation ────────────────────────────────────────────────────────────────

it('rejects estimated_days_max less than estimated_days_min', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.ecommerce.shipping-methods.store'), [
            'carrier' => 'dpd',
            'name' => ['en' => 'DPD Bad Days'],
            'is_active' => true,
            'base_price' => 500,
            'price_per_kg' => 0,
            'estimated_days_min' => 5,
            'estimated_days_max' => 2,
        ])
        ->assertSessionHasErrors(['estimated_days_max']);
});

it('allows null dimension fields', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.ecommerce.shipping-methods.store'), [
            'carrier' => 'dpd',
            'name' => ['en' => 'DPD No Dims'],
            'is_active' => true,
            'base_price' => 600,
            'price_per_kg' => 0,
            'max_length_cm' => null,
            'max_width_cm' => null,
            'max_depth_cm' => null,
        ])
        ->assertRedirect();

    $method = ShippingMethod::query()->where('base_price', 600)->first();
    expect($method)->not->toBeNull();
    expect($method->max_length_cm)->toBeNull();
    expect($method->max_width_cm)->toBeNull();
    expect($method->max_depth_cm)->toBeNull();
});

it('rejects dimension values below minimum of 1', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.ecommerce.shipping-methods.store'), [
            'carrier' => 'dpd',
            'name' => ['en' => 'DPD Zero Dim'],
            'is_active' => true,
            'base_price' => 700,
            'price_per_kg' => 0,
            'max_length_cm' => 0,
        ])
        ->assertSessionHasErrors(['max_length_cm']);
});

// ── Model ─────────────────────────────────────────────────────────────────────

it('hasMaxDimensions returns true when at least one dimension is set', function (): void {
    $method = ShippingMethod::query()->make([
        'carrier' => 'dpd',
        'name' => ['en' => 'Test'],
        'max_length_cm' => 100,
        'max_width_cm' => null,
        'max_depth_cm' => null,
    ]);

    expect($method->hasMaxDimensions())->toBeTrue();
});

it('hasMaxDimensions returns false when all dimensions are null', function (): void {
    $method = ShippingMethod::query()->make([
        'carrier' => 'dpd',
        'name' => ['en' => 'Test'],
        'max_length_cm' => null,
        'max_width_cm' => null,
        'max_depth_cm' => null,
    ]);

    expect($method->hasMaxDimensions())->toBeFalse();
});
