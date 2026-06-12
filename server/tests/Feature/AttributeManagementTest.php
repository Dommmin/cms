<?php

declare(strict_types=1);

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

dataset('supported-attribute-types', [
    'text' => ['text'],
    'numeric' => ['numeric'],
    'boolean' => ['boolean'],
    'select' => ['select'],
    'multiselect' => ['multiselect'],
    'color' => ['color'],
    'date' => ['date'],
]);

it('creates attributes with every supported canonical type', function (string $type): void {
    $payload = [
        'name' => 'Attribute '.mb_strtoupper($type),
        'slug' => 'attribute-'.$type,
        'type' => $type,
        'unit' => $type === 'numeric' ? 'cm' : null,
        'is_filterable' => true,
        'is_variant_selection' => $type !== 'text',
        'position' => 2,
        'values' => in_array($type, ['select', 'multiselect', 'color'], true) ? [[
            'value' => 'Primary',
            'slug' => 'primary',
            'color_hex' => $type === 'color' ? '#ff0000' : null,
            'position' => 0,
        ]] : [],
    ];

    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.attributes.store'), $payload)
        ->assertRedirect(route('admin.ecommerce.attributes.index'))
        ->assertSessionHasNoErrors();

    $attribute = Attribute::query()->where('slug', 'attribute-'.$type)->first();

    expect($attribute)->not->toBeNull()
        ->and($attribute?->type->value)->toBe($type);
})->with('supported-attribute-types');

it('normalizes legacy number type to numeric', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.attributes.store'), [
            'name' => 'Width',
            'slug' => 'width',
            'type' => 'number',
            'unit' => 'cm',
        ])
        ->assertRedirect(route('admin.ecommerce.attributes.index'))
        ->assertSessionHasNoErrors();

    expect(Attribute::query()->where('slug', 'width')->firstOrFail()->type->value)
        ->toBe('numeric');
});

it('rejects unsupported attribute types', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.attributes.store'), [
            'name' => 'Unsupported',
            'slug' => 'unsupported',
            'type' => 'json',
        ])
        ->assertSessionHasErrors(['type']);
});

it('rejects non-discrete attributes as storefront filters or variant selectors', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.attributes.store'), [
            'name' => 'Launch Date',
            'slug' => 'launch-date',
            'type' => 'date',
            'is_filterable' => true,
            'is_variant_selection' => true,
        ])
        ->assertSessionHasErrors([
            'is_filterable',
            'is_variant_selection',
        ]);
});

it('stores attribute values using slug and color_hex columns', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.attributes.store'), [
            'name' => 'Color',
            'slug' => 'color',
            'type' => 'color',
            'values' => [[
                'value' => 'Ocean Blue',
                'slug' => 'ocean-blue',
                'color_hex' => '#00aaff',
                'position' => 3,
            ]],
        ])
        ->assertRedirect(route('admin.ecommerce.attributes.index'))
        ->assertSessionHasNoErrors();

    $value = AttributeValue::query()->where('slug', 'ocean-blue')->first();

    expect($value)->not->toBeNull()
        ->and($value?->color_hex)->toBe('#00aaff')
        ->and($value?->position)->toBe(3);
});

it('normalizes legacy label and color_code payload fields', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.attributes.store'), [
            'name' => 'Finish',
            'slug' => 'finish',
            'type' => 'color',
            'values' => [[
                'value' => 'Matte Black',
                'label' => 'Matte Black',
                'color_code' => '#111111',
            ]],
        ])
        ->assertRedirect(route('admin.ecommerce.attributes.index'))
        ->assertSessionHasNoErrors();

    $value = AttributeValue::query()->where('value', 'Matte Black')->firstOrFail();

    expect($value->slug)->toBe('matte-black')
        ->and($value->color_hex)->toBe('#111111');
});

it('updates attribute values with the canonical admin payload', function (): void {
    $attribute = Attribute::factory()->create([
        'type' => 'color',
        'slug' => 'finish',
    ]);
    $value = AttributeValue::factory()->for($attribute)->create([
        'value' => 'Black',
        'slug' => 'black',
        'color_hex' => '#000000',
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.ecommerce.attributes.update', $attribute), [
            'name' => 'Finish',
            'slug' => 'finish',
            'type' => 'color',
            'unit' => '',
            'is_filterable' => true,
            'is_variant_selection' => true,
            'position' => 1,
            'values' => [[
                'id' => $value->id,
                'value' => 'Graphite',
                'slug' => 'graphite',
                'color_hex' => '#222222',
                'position' => 0,
            ]],
        ])
        ->assertSessionHasNoErrors();

    $value->refresh();

    expect($value->value)->toBe('Graphite')
        ->and($value->slug)->toBe('graphite')
        ->and($value->color_hex)->toBe('#222222');
});

it('rejects duplicate attribute value slugs in a single payload', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.attributes.store'), [
            'name' => 'Finish',
            'slug' => 'finish',
            'type' => 'select',
            'values' => [
                ['value' => 'Black', 'slug' => 'black'],
                ['value' => 'Black 2', 'slug' => 'black'],
            ],
        ])
        ->assertSessionHasErrors(['values']);
});

it('rejects attribute value ids that belong to another attribute', function (): void {
    $attribute = Attribute::factory()->create(['slug' => 'finish']);
    $otherAttribute = Attribute::factory()->create(['slug' => 'material']);
    $otherValue = AttributeValue::factory()->for($otherAttribute)->create();

    $this->actingAs($this->admin)
        ->put(route('admin.ecommerce.attributes.update', $attribute), [
            'name' => 'Finish',
            'slug' => 'finish',
            'type' => 'select',
            'unit' => '',
            'is_filterable' => false,
            'is_variant_selection' => false,
            'position' => 0,
            'values' => [[
                'id' => $otherValue->id,
                'value' => 'Illegal',
                'slug' => 'illegal',
            ]],
        ])
        ->assertSessionHasErrors(['values']);
});
