<?php

declare(strict_types=1);

use App\Models\Currency;
use App\Models\CustomReport;
use App\Models\Order;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
    Currency::factory()->create(['code' => 'PLN']);
});

it('can create a custom report', function (): void {
    $response = $this->actingAs($this->user)
        ->post(route('admin.reports.store'), [
            'name' => 'Sales Report',
            'description' => 'Monthly sales analysis',
            'data_source' => 'orders',
            'metrics' => ['revenue', 'count'],
            'filters' => [
                ['field' => 'status', 'operator' => 'in', 'value' => ['pending', 'processing']],
            ],
            'chart_type' => 'line',
            'is_public' => false,
        ]);

    $response->assertRedirect();

    expect(CustomReport::query()->count())->toBe(1);
    $report = CustomReport::query()->first();
    expect($report->name)->toBe('Sales Report');
    expect($report->user_id)->toBe($this->user->id);
});

it('can list reports', function (): void {
    CustomReport::factory()->create(['user_id' => $this->user->id, 'is_public' => true]);
    CustomReport::factory()->create(['user_id' => $this->user->id, 'is_public' => false]);

    $response = $this->actingAs($this->user)
        ->get(route('admin.reports.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('reports', 2)
    );
});

it('can view report results', function (): void {
    Order::factory()->count(5)->create();

    $report = CustomReport::factory()->create([
        'user_id' => $this->user->id,
        'data_source' => 'orders',
        'metrics' => ['count'],
        'filters' => [],
        'group_by' => [],
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('admin.reports.show', $report));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('results')
        ->has('report')
    );
});

it('can export report to csv', function (): void {
    Order::factory()->count(3)->create();

    $report = CustomReport::factory()->create([
        'user_id' => $this->user->id,
        'data_source' => 'orders',
        'metrics' => ['count'],
        'filters' => [],
        'group_by' => [],
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('admin.reports.export', $report));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
});

it('can delete a report', function (): void {
    $report = CustomReport::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)
        ->delete(route('admin.reports.destroy', $report));

    $response->assertRedirect();

    expect(CustomReport::query()->find($report->id))->toBeNull();
});
