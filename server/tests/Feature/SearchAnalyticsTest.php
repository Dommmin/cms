<?php

declare(strict_types=1);

use App\Models\SearchLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
});

it('logs a search query when invoking the search endpoint', function (): void {
    $this->getJson('/api/v1/search?q=laptop')
        ->assertSuccessful();

    expect(SearchLog::query()->where('query', 'laptop')->where('is_autocomplete', false)->exists())->toBeTrue();
});

it('does not log a search query shorter than 2 characters', function (): void {
    $this->getJson('/api/v1/search?q=a')
        ->assertSuccessful();

    expect(SearchLog::query()->count())->toBe(0);
});

it('logs an autocomplete query', function (): void {
    $this->getJson('/api/v1/search/autocomplete?q=sho')
        ->assertSuccessful();

    expect(SearchLog::query()->where('query', 'sho')->where('is_autocomplete', true)->exists())->toBeTrue();
});

it('normalises query to lowercase before logging', function (): void {
    $this->getJson('/api/v1/search?q=LAPTOP')
        ->assertSuccessful();

    expect(SearchLog::query()->where('query', 'laptop')->exists())->toBeTrue();
});

it('shows the search analytics page to an admin', function (): void {
    SearchLog::query()->create(['query' => 'shoes', 'results_count' => 5, 'is_autocomplete' => false]);
    SearchLog::query()->create(['query' => 'boots', 'results_count' => 0, 'is_autocomplete' => false]);

    $response = $this->actingAs($this->user)
        ->get(route('admin.search.analytics'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/search/analytics')
        ->has('topQueries')
        ->has('zeroResults')
        ->has('dailyVolume')
        ->has('stats')
        ->has('days')
    );
});

it('returns correct stats on the analytics page', function (): void {
    SearchLog::query()->create(['query' => 'shoes', 'results_count' => 10, 'is_autocomplete' => false]);
    SearchLog::query()->create(['query' => 'boots', 'results_count' => 0,  'is_autocomplete' => false]);
    SearchLog::query()->create(['query' => 'shoes', 'results_count' => 8,  'is_autocomplete' => false]);
    // autocomplete should not count
    SearchLog::query()->create(['query' => 'sh', 'results_count' => 3, 'is_autocomplete' => true]);

    $response = $this->actingAs($this->user)
        ->get(route('admin.search.analytics'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.total_searches', 3)
        ->where('stats.unique_queries', 2)
        ->where('stats.zero_result_rate', 33.3)
    );
});

it('respects the days filter on the analytics page', function (): void {
    DB::table('search_logs')->insert([
        'query' => 'old-query',
        'results_count' => 1,
        'is_autocomplete' => false,
        'created_at' => now()->subDays(100),
        'updated_at' => now()->subDays(100),
    ]);

    SearchLog::query()->create(['query' => 'new-query', 'results_count' => 1, 'is_autocomplete' => false]);

    $response = $this->actingAs($this->user)
        ->get(route('admin.search.analytics', ['days' => 30]));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.total_searches', 1)
        ->where('days', 30)
    );
});
