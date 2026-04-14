<?php

declare(strict_types=1);

use App\Models\CustomReport;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\LaravelPdf\Facades\Pdf;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function (): void {
    seed([RolePermissionSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

it('downloads excel export for a custom report', function (): void {
    $report = CustomReport::factory()->create([
        'user_id' => $this->admin->id,
        'data_source' => 'orders',
        'metrics' => ['count'],
        'dimensions' => [],
        'group_by' => [],
    ]);

    $response = actingAs($this->admin, 'sanctum')
        ->get(route('admin.reports.export.excel', $report));

    $response->assertSuccessful();
    $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

it('downloads pdf export for a custom report', function (): void {
    Pdf::fake();

    $report = CustomReport::factory()->create([
        'user_id' => $this->admin->id,
        'data_source' => 'orders',
        'metrics' => ['count'],
        'dimensions' => [],
        'group_by' => [],
    ]);

    actingAs($this->admin, 'sanctum')
        ->get(route('admin.reports.export.pdf', $report));
});

it('returns 404 for excel export of non-existent report', function (): void {
    $response = actingAs($this->admin, 'sanctum')
        ->get(route('admin.reports.export.excel', 99999));

    $response->assertNotFound();
});

it('returns 404 for pdf export of non-existent report', function (): void {
    Pdf::fake();

    $response = actingAs($this->admin, 'sanctum')
        ->get(route('admin.reports.export.pdf', 99999));

    $response->assertNotFound();
});

it('unauthenticated request cannot access excel export', function (): void {
    $report = CustomReport::factory()->create(['user_id' => $this->admin->id]);

    $response = $this->get(route('admin.reports.export.excel', $report));

    $response->assertStatus(404);
});

it('unauthenticated request cannot access pdf export', function (): void {
    Pdf::fake();

    $report = CustomReport::factory()->create(['user_id' => $this->admin->id]);

    $response = $this->get(route('admin.reports.export.pdf', $report));

    $response->assertStatus(404);
});
