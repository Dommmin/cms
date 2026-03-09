<?php

declare(strict_types=1);

use App\Models\CookieConsent;
use App\Models\User;

it('records consent for all three categories', function (): void {
    $response = $this->postJson('/api/v1/consent', [
        'analytics' => true,
        'marketing' => false,
        'functional' => true,
        'session_id' => 'test-session-abc',
        'consent_version' => '1.0',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('message', 'Consent recorded.');

    expect(CookieConsent::query()->count())->toBe(3);

    $this->assertDatabaseHas('cookie_consents', [
        'category' => 'analytics',
        'granted' => true,
        'session_id' => 'test-session-abc',
        'consent_version' => '1.0',
    ]);

    $this->assertDatabaseHas('cookie_consents', [
        'category' => 'marketing',
        'granted' => false,
    ]);

    $this->assertDatabaseHas('cookie_consents', [
        'category' => 'functional',
        'granted' => true,
    ]);
});

it('always records functional as granted regardless of input', function (): void {
    $this->postJson('/api/v1/consent', [
        'analytics' => false,
        'marketing' => false,
        'functional' => false, // user passes false but it should be stored as true
    ])->assertStatus(201);

    $this->assertDatabaseHas('cookie_consents', [
        'category' => 'functional',
        'granted' => true,
    ]);
});

it('associates consent with authenticated user', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/consent', [
            'analytics' => true,
            'marketing' => true,
            'functional' => true,
        ])
        ->assertStatus(201);

    $this->assertDatabaseHas('cookie_consents', [
        'user_id' => $user->id,
        'category' => 'analytics',
        'granted' => true,
    ]);
});

it('validates required fields', function (): void {
    $this->postJson('/api/v1/consent', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['analytics', 'marketing', 'functional']);
});

it('rejects invalid boolean values', function (): void {
    $this->postJson('/api/v1/consent', [
        'analytics' => 'yes',
        'marketing' => 'no',
        'functional' => 'maybe',
    ])->assertStatus(422);
});
