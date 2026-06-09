<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Spatie\Health\Commands\RunHealthChecksCommand;

beforeEach(function (): void {
    Config::set('health.secret_token', 'test-health-token');
});

it('allows fresh health check in local environment', function (): void {
    App::detectEnvironment(fn (): string => 'local');
    Artisan::shouldReceive('call')->with(RunHealthChecksCommand::class)->once()->andReturn(0);

    $this->getJson('/api/health?fresh')
        ->assertOk();
});

it('denies fresh health check in production environment anonymously without token', function (): void {
    App::detectEnvironment(fn (): string => 'production');
    Artisan::shouldReceive('call')->never();

    $this->getJson('/api/health?fresh')
        ->assertStatus(403)
        ->assertJson(['message' => 'Unauthorized fresh health execution.']);
});

it('allows fresh health check in production environment with valid X-Health-Token', function (): void {
    App::detectEnvironment(fn (): string => 'production');
    Artisan::shouldReceive('call')->with(RunHealthChecksCommand::class)->once()->andReturn(0);

    $this->getJson('/api/health?fresh', [
        'X-Health-Token' => 'test-health-token',
    ])
        ->assertOk();
});

it('allows fresh health check in production environment for authenticated users', function (): void {
    App::detectEnvironment(fn (): string => 'production');
    Artisan::shouldReceive('call')->with(RunHealthChecksCommand::class)->once()->andReturn(0);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/health?fresh')
        ->assertOk();
});
