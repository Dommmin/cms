<?php

declare(strict_types=1);

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function (): void {
    seed([RolePermissionSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('blocks unauthenticated access to validate import', function (): void {
    $file = UploadedFile::fake()->createWithContent(
        'products.csv',
        "name,sku,price\nTest Product,SKU-001,100",
    );

    $this->post(route('admin.ecommerce.products.import.validate'), ['file' => $file])
        ->assertStatus(404);
});

it('validates that a file is required', function (): void {
    actingAs($this->admin)
        ->post(route('admin.ecommerce.products.import.validate'), [])
        ->assertSessionHasErrors(['file']);
});

it('validates file type', function (): void {
    $file = UploadedFile::fake()->create('products.txt', 10, 'text/plain');

    actingAs($this->admin)
        ->post(route('admin.ecommerce.products.import.validate'), ['file' => $file])
        ->assertSessionHasErrors(['file']);
});

it('returns valid result for a correct csv file', function (): void {
    Storage::fake('local');

    $csvContent = "name,sku,price\nTest Product,SKU-001,100\nAnother Product,SKU-002,200";
    $file = UploadedFile::fake()->createWithContent('products.csv', $csvContent);

    $response = actingAs($this->admin)
        ->post(route('admin.ecommerce.products.import.validate'), ['file' => $file]);

    $response->assertSuccessful()
        ->assertJsonStructure([
            'valid',
            'errors',
            'preview',
            'total_rows',
            'missing_headers',
        ])
        ->assertJson(['valid' => true, 'missing_headers' => []]);
});

it('returns missing headers when required columns are absent', function (): void {
    $csvContent = "product_name,code,cost\nTest Product,SKU-001,100";
    $file = UploadedFile::fake()->createWithContent('products.csv', $csvContent);

    $response = actingAs($this->admin)
        ->post(route('admin.ecommerce.products.import.validate'), ['file' => $file]);

    $response->assertSuccessful()
        ->assertJson(['valid' => false])
        ->assertJsonPath('missing_headers.0', 'name');
});

it('returns validation errors for invalid rows', function (): void {
    $csvContent = "name,sku,price\n,SKU-001,not-a-price";
    $file = UploadedFile::fake()->createWithContent('products.csv', $csvContent);

    $response = actingAs($this->admin)
        ->post(route('admin.ecommerce.products.import.validate'), ['file' => $file]);

    $response->assertSuccessful()
        ->assertJson(['valid' => false])
        ->assertJsonPath('errors.0.row', 2);
});

it('includes preview rows in the response', function (): void {
    $csvContent = "name,sku,price\nTest Product,SKU-001,100";
    $file = UploadedFile::fake()->createWithContent('products.csv', $csvContent);

    $response = actingAs($this->admin)
        ->post(route('admin.ecommerce.products.import.validate'), ['file' => $file]);

    $response->assertSuccessful()
        ->assertJsonCount(1, 'preview')
        ->assertJsonPath('total_rows', 1);
});
