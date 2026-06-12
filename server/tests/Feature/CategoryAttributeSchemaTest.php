<?php

declare(strict_types=1);

use App\Models\Attribute;
use App\Models\Category;
use App\Models\CategoryAttributeSchema;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductTypeAttribute;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('assigns attribute definitions to a category in admin flow', function (): void {
    $material = Attribute::factory()->create(['name' => 'Material', 'slug' => 'material', 'type' => 'select']);
    $width = Attribute::factory()->create(['name' => 'Width', 'slug' => 'width', 'type' => 'numeric']);

    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.categories.store'), [
            'name' => ['en' => 'Furniture'],
            'slug' => ['en' => 'furniture'],
            'description' => ['en' => 'Furniture category'],
            'is_active' => true,
            'attribute_schema' => [
                ['attribute_id' => $material->id, 'is_required' => true, 'position' => 0],
                ['attribute_id' => $width->id, 'is_required' => false, 'position' => 1],
            ],
        ])
        ->assertRedirect(route('admin.ecommerce.categories.index'))
        ->assertSessionHasNoErrors();

    $category = Category::query()->where('slug->en', 'furniture')->firstOrFail();

    expect($category->attributeSchemas()->pluck('attribute_id')->all())
        ->toBe([$material->id, $width->id]);
});

it('stores required and optional flags for category schema attributes', function (): void {
    $category = Category::factory()->create();
    $material = Attribute::factory()->create(['slug' => 'material']);
    $width = Attribute::factory()->create(['slug' => 'width']);

    $this->actingAs($this->admin)
        ->put(route('admin.ecommerce.categories.update', $category), [
            'name' => ['en' => 'Updated category'],
            'slug' => ['en' => 'updated-category'],
            'description' => ['en' => 'Updated description'],
            'is_active' => true,
            'attribute_schema' => [
                ['attribute_id' => $material->id, 'is_required' => true, 'position' => 0],
                ['attribute_id' => $width->id, 'is_required' => false, 'position' => 1],
            ],
        ])
        ->assertRedirect(route('admin.ecommerce.categories.index'))
        ->assertSessionHasNoErrors();

    $schema = $category->fresh()->attributeSchemas()->orderBy('position')->get();

    expect($schema)->toHaveCount(2)
        ->and($schema[0]->attribute_id)->toBe($material->id)
        ->and($schema[0]->is_required)->toBeTrue()
        ->and($schema[1]->attribute_id)->toBe($width->id)
        ->and($schema[1]->is_required)->toBeFalse();
});

it('rejects duplicate attribute definitions in a single category schema payload', function (): void {
    $attribute = Attribute::factory()->create(['slug' => 'material']);

    $this->actingAs($this->admin)
        ->post(route('admin.ecommerce.categories.store'), [
            'name' => ['en' => 'Duplicate schema'],
            'slug' => ['en' => 'duplicate-schema'],
            'description' => ['en' => 'Duplicate schema'],
            'attribute_schema' => [
                ['attribute_id' => $attribute->id, 'is_required' => true, 'position' => 0],
                ['attribute_id' => $attribute->id, 'is_required' => false, 'position' => 1],
            ],
        ])
        ->assertSessionHasErrors(['attribute_schema']);
});

it('enforces unique category and attribute pairs in category schema storage', function (): void {
    $category = Category::factory()->create();
    $attribute = Attribute::factory()->create();

    CategoryAttributeSchema::query()->create([
        'category_id' => $category->id,
        'attribute_id' => $attribute->id,
        'is_required' => true,
        'position' => 0,
    ]);

    expect(fn () => CategoryAttributeSchema::query()->create([
        'category_id' => $category->id,
        'attribute_id' => $attribute->id,
        'is_required' => false,
        'position' => 1,
    ]))->toThrow(QueryException::class);
});

it('inherits parent category schema definitions without inheriting product values', function (): void {
    $material = Attribute::factory()->create(['name' => 'Material', 'slug' => 'material']);
    $finish = Attribute::factory()->create(['name' => 'Finish', 'slug' => 'finish']);

    $parent = Category::factory()->create([
        'name' => ['en' => 'Parent'],
        'slug' => ['en' => 'parent'],
    ]);
    $child = Category::factory()->create([
        'parent_id' => $parent->id,
        'name' => ['en' => 'Child'],
        'slug' => ['en' => 'child'],
    ]);

    CategoryAttributeSchema::factory()->for($parent)->create([
        'attribute_id' => $material->id,
        'is_required' => true,
        'position' => 0,
    ]);
    CategoryAttributeSchema::factory()->for($child)->create([
        'attribute_id' => $finish->id,
        'is_required' => false,
        'position' => 1,
    ]);

    $resolved = $child->fresh()->resolvedAttributeSchemas();

    expect($resolved)->toHaveCount(2)
        ->and($resolved->pluck('attribute_id')->all())->toBe([$material->id, $finish->id])
        ->and($resolved->firstWhere('attribute_id', $material->id)?->getAttribute('is_inherited'))->toBeTrue()
        ->and($resolved->firstWhere('attribute_id', $finish->id)?->getAttribute('is_inherited'))->toBeFalse();

    $product = Product::factory()->create([
        'category_id' => $child->id,
    ]);

    $this->getJson('/api/v1/products/'.$product->getTranslation('slug', 'en'))
        ->assertOk()
        ->assertJsonPath('attributes', []);
});

it('lets a child category override an inherited attribute definition', function (): void {
    $material = Attribute::factory()->create(['name' => 'Material', 'slug' => 'material']);
    $finish = Attribute::factory()->create(['name' => 'Finish', 'slug' => 'finish']);

    $parent = Category::factory()->create();
    $child = Category::factory()->create(['parent_id' => $parent->id]);

    CategoryAttributeSchema::factory()->for($parent)->create([
        'attribute_id' => $material->id,
        'is_required' => true,
        'position' => 5,
    ]);
    CategoryAttributeSchema::factory()->for($parent)->create([
        'attribute_id' => $finish->id,
        'is_required' => false,
        'position' => 10,
    ]);
    CategoryAttributeSchema::factory()->for($child)->create([
        'attribute_id' => $material->id,
        'is_required' => false,
        'position' => 1,
    ]);

    $resolved = $child->fresh()->resolvedAttributeSchemas();
    $materialSchema = $resolved->firstWhere('attribute_id', $material->id);
    $finishSchema = $resolved->firstWhere('attribute_id', $finish->id);

    expect($resolved)->toHaveCount(2)
        ->and($resolved->pluck('attribute_id')->all())->toBe([$material->id, $finish->id])
        ->and($materialSchema?->is_required)->toBeFalse()
        ->and($materialSchema?->position)->toBe(1)
        ->and($materialSchema?->getAttribute('is_inherited'))->toBeFalse()
        ->and($finishSchema?->getAttribute('is_inherited'))->toBeTrue();
});

it('orders resolved schema by position after inheritance is merged', function (): void {
    $first = Attribute::factory()->create(['name' => 'First', 'slug' => 'first']);
    $second = Attribute::factory()->create(['name' => 'Second', 'slug' => 'second']);
    $third = Attribute::factory()->create(['name' => 'Third', 'slug' => 'third']);

    $parent = Category::factory()->create();
    $child = Category::factory()->create(['parent_id' => $parent->id]);

    CategoryAttributeSchema::factory()->for($parent)->create([
        'attribute_id' => $third->id,
        'position' => 30,
    ]);
    CategoryAttributeSchema::factory()->for($parent)->create([
        'attribute_id' => $second->id,
        'position' => 20,
    ]);
    CategoryAttributeSchema::factory()->for($child)->create([
        'attribute_id' => $first->id,
        'position' => 10,
    ]);

    expect($child->fresh()->resolvedAttributeSchemas()->pluck('attribute_id')->all())
        ->toBe([$first->id, $second->id, $third->id]);
});

it('clears direct category schema when an empty payload is submitted', function (): void {
    $category = Category::factory()->create();
    $attribute = Attribute::factory()->create(['slug' => 'material']);

    CategoryAttributeSchema::factory()->for($category)->create([
        'attribute_id' => $attribute->id,
        'is_required' => true,
        'position' => 0,
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.ecommerce.categories.update', $category), [
            'name' => ['en' => 'Cleared schema'],
            'slug' => ['en' => 'cleared-schema'],
            'description' => ['en' => 'Cleared schema'],
            'is_active' => true,
            'attribute_schema' => [],
        ])
        ->assertRedirect(route('admin.ecommerce.categories.index'))
        ->assertSessionHasNoErrors();

    expect($category->fresh()->attributeSchemas()->count())->toBe(0);
});

it('backfills category schema from product type attributes without removing legacy rows', function (): void {
    $migration = require base_path('database/migrations/2026_06_12_130000_create_category_attribute_schemas_table.php');
    $migration->down();

    expect(Schema::hasTable('category_attribute_schemas'))->toBeFalse();

    $productType = ProductType::factory()->create();
    $attribute = Attribute::factory()->create(['slug' => 'legacy-material']);
    $category = Category::factory()->create(['product_type_id' => $productType->id]);

    ProductTypeAttribute::query()->create([
        'product_type_id' => $productType->id,
        'attribute_id' => $attribute->id,
        'is_required' => true,
        'position' => 4,
    ]);

    $migration->up();

    $schema = CategoryAttributeSchema::query()
        ->where('category_id', $category->id)
        ->where('attribute_id', $attribute->id)
        ->first();

    expect(Schema::hasTable('category_attribute_schemas'))->toBeTrue()
        ->and($schema)->not->toBeNull()
        ->and($schema?->is_required)->toBeTrue()
        ->and($schema?->position)->toBe(4)
        ->and(ProductTypeAttribute::query()->where('product_type_id', $productType->id)->count())->toBe(1);
});
