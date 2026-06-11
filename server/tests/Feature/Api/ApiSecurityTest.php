<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Laravel\Sanctum\Sanctum;

beforeEach(function (): void {
    Cache::flush();
});

it('captures IP address and user agent in custom PersonalAccessToken model', function (): void {
    $user = User::factory()->create();

    $response = $this->withHeaders([
        'User-Agent' => 'TestBrowser/1.0',
    ])->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertOk();

    $token = $user->tokens()->first();
    expect($token)->not->toBeNull();
    expect($token->user_agent)->toBe('TestBrowser/1.0');
    expect($token->ip_address)->toBe('127.0.0.1');
});

it('returns a two factor challenge response if user has enabled 2FA', function (): void {
    $user = User::factory()->create([
        'two_factor_secret' => encrypt('secret_key'),
        'two_factor_confirmed_at' => now(),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonPath('two_factor_challenge', true)
        ->assertJsonStructure(['challenge_token']);

    $challengeToken = $response->json('challenge_token');
    expect(Cache::has('2fa_challenge_'.$challengeToken))->toBeTrue();
    expect(Cache::get('2fa_challenge_'.$challengeToken))->toBe($user->id);
});

it('verifies a 2FA challenge using a valid TOTP code', function (): void {
    $user = User::factory()->create([
        'two_factor_secret' => encrypt('secret_key'),
        'two_factor_confirmed_at' => now(),
    ]);

    $challengeToken = Str::random(40);
    Cache::put('2fa_challenge_'.$challengeToken, $user->id, now()->addMinutes(5));

    $providerMock = mock(TwoFactorAuthenticationProvider::class);
    $providerMock->shouldReceive('verify')
        ->once()
        ->with('secret_key', '123456')
        ->andReturn(true);

    $this->app->instance(TwoFactorAuthenticationProvider::class, $providerMock);

    $response = $this->postJson('/api/v1/auth/two-factor/challenge', [
        'challenge_token' => $challengeToken,
        'code' => '123456',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['user', 'token']);

    expect(Cache::has('2fa_challenge_'.$challengeToken))->toBeFalse();
});

it('enables and confirms 2FA successfully', function (): void {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    // 1. Enable 2FA
    $response = $this->postJson('/api/v1/auth/two-factor/authentication');
    $response->assertOk()
        ->assertJsonStructure(['svg', 'secret']);

    $user->refresh();
    expect($user->two_factor_secret)->not->toBeNull();
    expect($user->two_factor_confirmed_at)->toBeNull();

    // Mock confirmation provider
    $providerMock = mock(TwoFactorAuthenticationProvider::class);
    $providerMock->shouldReceive('verify')
        ->once()
        ->andReturn(true);
    $this->app->instance(TwoFactorAuthenticationProvider::class, $providerMock);

    // 2. Confirm 2FA
    $response = $this->postJson('/api/v1/auth/two-factor/confirmed-authentication', [
        'code' => '123456',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['message', 'recovery_codes']);

    $user->refresh();
    expect($user->two_factor_confirmed_at)->not->toBeNull();
});

it('lists and revokes active token sessions', function (): void {
    $user = User::factory()->create();
    $token1 = $user->createToken('device-1');
    $token2 = $user->createToken('device-2');

    Sanctum::actingAs($user, [], 'sanctum');

    // List sessions
    $response = $this->getJson('/api/v1/auth/sessions');
    $response->assertOk()
        ->assertJsonCount(2);

    // Revoke device-2
    $response = $this->deleteJson('/api/v1/auth/sessions/'.$token2->accessToken->id);
    $response->assertOk();

    expect($user->tokens()->where('id', $token2->accessToken->id)->exists())->toBeFalse();
    expect($user->tokens()->where('id', $token1->accessToken->id)->exists())->toBeTrue();
});
