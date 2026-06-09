<?php

declare(strict_types=1);

use App\Models\SupportConversation;
use App\Models\User;
use App\Services\TurnstileService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Route;

beforeEach(function (): void {
    Config::set('services.cloudflare.turnstile_secret', 'test-turnstile-secret');
});

it('has throttling middleware applied to support routes', function (): void {
    $routes = collect(Route::getRoutes())->filter(fn ($r): bool => str_starts_with((string) $r->uri(), 'api/v1/support'));

    expect($routes)->not->toBeEmpty();
    foreach ($routes as $route) {
        expect($route->middleware())->toContain('throttle:api.strict');
    }
});

it('requires cf_turnstile_response for guest starting a conversation when turnstile secret is set', function (): void {
    $payload = [
        'email' => 'guest@example.com',
        'name' => 'Guest User',
        'subject' => 'Help needed',
        'body' => 'I cannot log in to my account.',
    ];

    $this->postJson(route('api.v1.support.conversations.store'), $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['cf_turnstile_response']);
});

it('allows guest to start a conversation with valid cf_turnstile_response', function (): void {
    $this->mock(TurnstileService::class, function ($mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(true);
    });

    $payload = [
        'email' => 'guest@example.com',
        'name' => 'Guest User',
        'subject' => 'Help needed',
        'body' => 'I cannot log in to my account.',
        'cf_turnstile_response' => 'valid-token',
    ];

    $this->postJson(route('api.v1.support.conversations.store'), $payload)
        ->assertCreated();
});

it('does not require cf_turnstile_response for authenticated users', function (): void {
    $user = User::factory()->create();

    $payload = [
        'subject' => 'Help needed',
        'body' => 'Authenticated user message.',
    ];

    $this->actingAs($user)
        ->postJson(route('api.v1.support.conversations.store'), $payload)
        ->assertCreated();
});

it('allows guest to add a message to an existing conversation without turnstile', function (): void {
    $conversation = SupportConversation::factory()->create();

    $this->postJson(
        route('api.v1.support.conversations.messages.store', ['token' => $conversation->token]),
        ['body' => 'Follow-up message from guest.'],
    )->assertCreated();
});
