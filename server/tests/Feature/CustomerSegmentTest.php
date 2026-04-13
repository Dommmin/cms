<?php

declare(strict_types=1);

use App\Models\CustomerSegment;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
});

it('can list customer segments', function (): void {
    CustomerSegment::factory()->count(3)->create();

    $response = $this->actingAs($this->user)
        ->get(route('admin.ecommerce.customer-segments.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/ecommerce/customer-segments/index')
        ->has('segments.data', 3)
    );
});

it('can show create form', function (): void {
    $response = $this->actingAs($this->user)
        ->get(route('admin.ecommerce.customer-segments.create'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/ecommerce/customer-segments/create')
    );
});

it('can create a manual segment', function (): void {
    $response = $this->actingAs($this->user)
        ->post(route('admin.ecommerce.customer-segments.store'), [
            'name' => 'VIP Customers',
            'description' => 'High-value customers',
            'type' => 'manual',
            'is_active' => true,
        ]);

    $response->assertRedirect(route('admin.ecommerce.customer-segments.index'));

    expect(CustomerSegment::query()->count())->toBe(1);
    $segment = CustomerSegment::query()->first();
    expect($segment->name)->toBe('VIP Customers');
    expect($segment->type)->toBe('manual');
    expect($segment->is_active)->toBeTrue();
    expect($segment->customers_count)->toBe(0);
});

it('can create a dynamic segment with rules', function (): void {
    $response = $this->actingAs($this->user)
        ->post(route('admin.ecommerce.customer-segments.store'), [
            'name' => 'High Spenders',
            'type' => 'dynamic',
            'is_active' => true,
            'rules' => [
                ['field' => 'total_spent', 'operator' => '>', 'value' => '1000'],
            ],
        ]);

    $response->assertRedirect(route('admin.ecommerce.customer-segments.index'));

    $segment = CustomerSegment::query()->first();
    expect($segment->type)->toBe('dynamic');
    expect($segment->rules)->toHaveCount(1);
    expect($segment->rules[0]['field'])->toBe('total_spent');
});

it('validates required fields on store', function (): void {
    $response = $this->actingAs($this->user)
        ->post(route('admin.ecommerce.customer-segments.store'), [
            'name' => '',
            'type' => 'invalid_type',
        ]);

    $response->assertSessionHasErrors(['name', 'type']);
});

it('can show edit form', function (): void {
    $segment = CustomerSegment::factory()->create();

    $response = $this->actingAs($this->user)
        ->get(route('admin.ecommerce.customer-segments.edit', $segment));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/ecommerce/customer-segments/edit')
        ->has('segment')
        ->where('segment.id', $segment->id)
    );
});

it('can update a segment', function (): void {
    $segment = CustomerSegment::factory()->create([
        'name' => 'Old Name',
        'is_active' => false,
    ]);

    $response = $this->actingAs($this->user)
        ->put(route('admin.ecommerce.customer-segments.update', $segment), [
            'name' => 'New Name',
            'type' => 'manual',
            'is_active' => true,
        ]);

    $response->assertRedirect();

    $segment->refresh();
    expect($segment->name)->toBe('New Name');
    expect($segment->is_active)->toBeTrue();
});

it('can delete a segment', function (): void {
    $segment = CustomerSegment::factory()->create();

    $response = $this->actingAs($this->user)
        ->delete(route('admin.ecommerce.customer-segments.destroy', $segment));

    $response->assertRedirect();

    expect(CustomerSegment::query()->count())->toBe(0);
});

it('sync endpoint only works for dynamic segments', function (): void {
    $manual = CustomerSegment::factory()->create(['type' => 'manual']);

    $response = $this->actingAs($this->user)
        ->post(route('admin.ecommerce.customer-segments.sync', $manual));

    $response->assertRedirect();
    $response->assertSessionHas('error');
});
