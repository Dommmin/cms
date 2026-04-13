<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

it('returns 200 and ok status when all services are healthy', function (): void {
    $this->getJson('/health')
        ->assertSuccessful()
        ->assertJsonPath('status', 'ok')
        ->assertJsonStructure([
            'status',
            'checks' => ['db', 'redis', 'disk'],
            'version',
            'slot',
        ]);
});

it('returns 503 and degraded status when the database is unavailable', function (): void {
    DB::shouldReceive('connection')->andThrow(new RuntimeException('DB down'));

    $this->getJson('/health')
        ->assertStatus(503)
        ->assertJsonPath('status', 'degraded')
        ->assertJsonPath('checks.db', false);
});

it('returns 503 and degraded status when redis is unavailable', function (): void {
    Redis::shouldReceive('ping')->andThrow(new RuntimeException('Redis down'));

    $this->getJson('/health')
        ->assertStatus(503)
        ->assertJsonPath('status', 'degraded')
        ->assertJsonPath('checks.redis', false);
});

it('includes the app version in the response', function (): void {
    config(['app.version' => '1.2.3']);

    $this->getJson('/health')
        ->assertJsonPath('version', '1.2.3');
});

it('includes the active deployment slot in the response', function (): void {
    config(['app.slot' => 'blue']);

    $this->getJson('/health')
        ->assertJsonPath('slot', 'blue');
});

it('is accessible without authentication', function (): void {
    $this->getJson('/health')
        ->assertSuccessful();
});
