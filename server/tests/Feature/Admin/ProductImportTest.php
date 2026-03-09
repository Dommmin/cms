<?php

declare(strict_types=1);

use App\Imports\ProductsImport;
use App\Models\Attribute;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Row;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $this->actingAs($admin);
});

it('imports products from xlsx file', function () {
    Excel::fake();

    ProductType::query()->create([
        'name' => 'Simple',
        'slug' => 'simple',
        'has_variants' => false,
        'is_shippable' => true,
    ]);

    $file = UploadedFile::fake()->createWithContent(
        'products.xlsx',
        'fake-xlsx-content'
    );

    $this->post(route('admin.ecommerce.products.import'), ['file' => $file])
        ->assertRedirect();

    Excel::assertImported('products.xlsx');
});

it('rejects import with invalid file type', function () {
    $file = UploadedFile::fake()->create('products.pdf', 100, 'application/pdf');

    $this->post(route('admin.ecommerce.products.import'), ['file' => $file])
        ->assertSessionHasErrors('file');
});

it('creates product with default variant when no variant_sku', function () {
    ProductType::factory()->create();
    Category::factory()->create();

    $import = new ProductsImport;

    $row = makeRow([
        'name' => 'Test Product',
        'sku' => 'TEST-001',
        'price' => '19.99',
        'stock' => '10',
        'description' => 'A test product',
        'variant_sku' => null,
        'variant_price' => null,
        'variant_stock' => null,
        'variant_name' => null,
    ]);

    $import->onRow($row);

    $product = Product::query()->where('sku_prefix', 'TEST-001')->first();
    expect($product)->not->toBeNull();

    $variant = ProductVariant::query()->where('sku', 'TEST-001')->first();
    expect($variant)->not->toBeNull()
        ->and($variant->name)->toBe('Default')
        ->and($variant->price)->toBe(1999)
        ->and($variant->is_default)->toBeTrue();
});

it('creates product with multiple variants from separate rows', function () {
    ProductType::factory()->create();
    Category::factory()->create();

    $import = new ProductsImport;

    $rowRed = makeRow([
        'name' => 'T-Shirt',
        'sku' => 'TSHIRT',
        'price' => '29.99',
        'stock' => '0',
        'description' => 'A T-Shirt',
        'variant_sku' => 'TSHIRT-RED-M',
        'variant_name' => 'Red / M',
        'variant_price' => '29.99',
        'variant_stock' => '5',
        'attribute_color' => 'Red',
        'attribute_size' => 'M',
    ]);

    $rowBlue = makeRow([
        'name' => 'T-Shirt',
        'sku' => 'TSHIRT',
        'price' => '29.99',
        'stock' => '0',
        'description' => 'A T-Shirt',
        'variant_sku' => 'TSHIRT-BLUE-L',
        'variant_name' => 'Blue / L',
        'variant_price' => '32.00',
        'variant_stock' => '3',
        'attribute_color' => 'Blue',
        'attribute_size' => 'L',
    ]);

    $import->onRow($rowRed);
    $import->onRow($rowBlue);

    expect(Product::query()->where('sku_prefix', 'TSHIRT')->count())->toBe(1);
    expect(ProductVariant::query()->where('sku', 'TSHIRT-RED-M')->exists())->toBeTrue();
    expect(ProductVariant::query()->where('sku', 'TSHIRT-BLUE-L')->exists())->toBeTrue();
});

it('creates attribute values and links them to variant', function () {
    ProductType::factory()->create();
    Category::factory()->create();

    $import = new ProductsImport;

    $row = makeRow([
        'name' => 'Shirt',
        'sku' => 'SHIRT',
        'price' => '20.00',
        'stock' => '0',
        'description' => '',
        'variant_sku' => 'SHIRT-RED',
        'variant_name' => 'Red',
        'variant_price' => '20.00',
        'variant_stock' => '5',
        'attribute_color' => 'Red',
        'attribute_size' => null,
    ]);

    $import->onRow($row);

    $attribute = Attribute::query()->where('slug', 'color')->first();
    expect($attribute)->not->toBeNull();

    $variant = ProductVariant::query()->where('sku', 'SHIRT-RED')->first();
    expect($variant->attributeValues()->count())->toBe(1);
});

it('does not duplicate variant when same variant_sku is imported twice', function () {
    ProductType::factory()->create();
    Category::factory()->create();

    $import = new ProductsImport;

    $row = makeRow([
        'name' => 'Widget',
        'sku' => 'WIDGET',
        'price' => '9.99',
        'stock' => '0',
        'description' => '',
        'variant_sku' => 'WIDGET-V1',
        'variant_name' => 'Variant 1',
        'variant_price' => '9.99',
        'variant_stock' => '10',
    ]);

    $import->onRow($row);
    $import->onRow($row); // duplicate

    expect(ProductVariant::query()->where('sku', 'WIDGET-V1')->count())->toBe(1);
});

function makeRow(array $data): Row
{
    $mock = Mockery::mock(Row::class);
    $mock->shouldReceive('toArray')->andReturn($data);

    return $mock;
}
