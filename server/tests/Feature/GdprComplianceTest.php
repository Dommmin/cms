<?php

declare(strict_types=1);

use App\Models\CookieConsent;
use App\Models\User;
use App\Notifications\AccountDeletedNotification;
use Illuminate\Support\Facades\Notification;

// ── GET /api/v1/consent ───────────────────────────────────────────────────────

it('returns default consent data when no consent exists for user', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/consent')
        ->assertSuccessful()
        ->assertJson([
            'functional' => true,
            'analytics' => false,
            'marketing' => false,
        ]);
});

it('returns existing consent data for authenticated user', function (): void {
    $user = User::factory()->create();

    CookieConsent::factory()->create([
        'user_id' => $user->id,
        'category' => 'analytics',
        'granted' => true,
        'consent_version' => 'v1',
    ]);

    CookieConsent::factory()->create([
        'user_id' => $user->id,
        'category' => 'marketing',
        'granted' => false,
        'consent_version' => 'v1',
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/consent')
        ->assertSuccessful()
        ->assertJson([
            'functional' => true,
            'analytics' => true,
            'marketing' => false,
            'consent_version' => 'v1',
        ]);
});

it('returns consent data for guest using session id', function (): void {
    $sessionId = 'test-session-abc123';

    CookieConsent::factory()->create([
        'session_id' => $sessionId,
        'user_id' => null,
        'category' => 'marketing',
        'granted' => true,
        'consent_version' => 'v2',
    ]);

    $this->withHeaders(['X-Session-ID' => $sessionId])
        ->getJson('/api/v1/consent')
        ->assertSuccessful()
        ->assertJson([
            'functional' => true,
            'marketing' => true,
        ]);
});

it('returns default consent when no session id or auth provided', function (): void {
    $this->getJson('/api/v1/consent')
        ->assertSuccessful()
        ->assertJson([
            'functional' => true,
            'analytics' => false,
            'marketing' => false,
        ]);
});

// ── POST /api/v1/consent ──────────────────────────────────────────────────────

it('stores consent for authenticated user', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/consent', [
            'analytics' => true,
            'marketing' => false,
            'functional' => true,
            'session_id' => null,
            'consent_version' => 'v1',
        ])
        ->assertCreated();

    $this->assertDatabaseHas('cookie_consents', [
        'user_id' => $user->id,
        'category' => 'analytics',
        'granted' => true,
    ]);

    $this->assertDatabaseHas('cookie_consents', [
        'user_id' => $user->id,
        'category' => 'marketing',
        'granted' => false,
    ]);
});

it('updates consent for user via post', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/consent', [
            'analytics' => false,
            'marketing' => true,
            'functional' => true,
        ])
        ->assertCreated();

    $this->assertDatabaseHas('cookie_consents', [
        'user_id' => $user->id,
        'category' => 'marketing',
        'granted' => true,
    ]);
});

// ── DELETE /api/v1/consent/{category} ─────────────────────────────────────────

it('withdraws consent for specific category', function (): void {
    $user = User::factory()->create();

    CookieConsent::factory()->create([
        'user_id' => $user->id,
        'category' => 'analytics',
        'granted' => true,
    ]);

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/v1/consent/analytics')
        ->assertNoContent();

    $this->assertDatabaseHas('cookie_consents', [
        'user_id' => $user->id,
        'category' => 'analytics',
        'granted' => false,
    ]);
});

// ── POST /api/v1/profile/restrict-processing ─────────────────────────────────

it('sets processing_restricted_at when user restricts processing', function (): void {
    $user = User::factory()->create(['processing_restricted_at' => null]);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/profile/restrict-processing')
        ->assertSuccessful()
        ->assertJson(['message' => 'Data processing has been restricted.']);

    expect($user->fresh()->processing_restricted_at)->not->toBeNull();
});

it('requires authentication to restrict processing', function (): void {
    $this->postJson('/api/v1/profile/restrict-processing')
        ->assertUnauthorized();
});

// ── DELETE /api/v1/profile/restrict-processing ───────────────────────────────

it('clears processing_restricted_at when user lifts restriction', function (): void {
    $user = User::factory()->create(['processing_restricted_at' => now()]);

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/v1/profile/restrict-processing')
        ->assertNoContent();

    expect($user->fresh()->processing_restricted_at)->toBeNull();
});

it('requires authentication to lift processing restriction', function (): void {
    $this->deleteJson('/api/v1/profile/restrict-processing')
        ->assertUnauthorized();
});

// ── Account deletion notification (Art. 19) ──────────────────────────────────

it('sends account deleted notification before anonymization', function (): void {
    Notification::fake();

    $user = User::factory()->create();
    $email = $user->email;

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/v1/profile', ['password' => 'password'])
        ->assertSuccessful();

    Notification::assertSentTo(
        $user,
        AccountDeletedNotification::class,
    );
});

// ── GET /api/v1/profile/export ────────────────────────────────────────────────

it('includes processing_restricted_at in data export', function (): void {
    $user = User::factory()->create(['processing_restricted_at' => now()->subDay()]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/profile/export')
        ->assertSuccessful();

    expect($response->json('account.processing_restricted_at'))->not->toBeNull();
});

it('includes null processing_restricted_at in data export when not restricted', function (): void {
    $user = User::factory()->create(['processing_restricted_at' => null]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/profile/export')
        ->assertSuccessful()
        ->assertJsonPath('account.processing_restricted_at', null);
});
