<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'customer']);
});

/**
 * Build a valid signed verification URL for the given user.
 */
function verificationUrl(User $user): string
{
    return URL::temporarySignedRoute(
        'api.v1.auth.email.verify',
        now()->addMinutes(60),
        ['id' => $user->getKey(), 'hash' => sha1($user->getEmailForVerification())]
    );
}

describe('Email Verification', function (): void {
    it('verifies email with valid signed URL', function (): void {
        $user = User::factory()->unverified()->create();
        $token = $user->createToken('api')->plainTextToken;

        $url = verificationUrl($user);

        $this->withToken($token)
            ->postJson($url)
            ->assertOk()
            ->assertJson(['message' => 'Email verified successfully']);

        expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    });

    it('returns 200 with idempotent message when email is already verified', function (): void {
        $user = User::factory()->create(); // factory creates with verified email by default
        $token = $user->createToken('api')->plainTextToken;

        $url = verificationUrl($user);

        $this->withToken($token)
            ->postJson($url)
            ->assertOk()
            ->assertJson(['message' => 'Email already verified']);
    });

    it('returns 403 with invalid hash', function (): void {
        $user = User::factory()->unverified()->create();
        $token = $user->createToken('api')->plainTextToken;

        $url = URL::temporarySignedRoute(
            'api.v1.auth.email.verify',
            now()->addMinutes(60),
            ['id' => $user->getKey(), 'hash' => 'invalid-hash']
        );

        $this->withToken($token)
            ->postJson($url)
            ->assertForbidden();
    });

    it('returns 401 when unauthenticated', function (): void {
        $user = User::factory()->unverified()->create();

        $url = verificationUrl($user);

        $this->postJson($url)
            ->assertUnauthorized();
    });

    it('returns 403 with tampered signature', function (): void {
        $user = User::factory()->unverified()->create();
        $token = $user->createToken('api')->plainTextToken;

        // Build URL then tamper with signature
        $url = verificationUrl($user).'tampered';

        $this->withToken($token)
            ->postJson($url)
            ->assertForbidden();
    });
});

describe('Resend Verification Email', function (): void {
    it('resends verification email for unverified user', function (): void {
        Notification::fake();

        $user = User::factory()->unverified()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/auth/email/resend')
            ->assertOk()
            ->assertJson(['message' => 'Verification email sent']);

        Notification::assertSentTo($user, VerifyEmail::class);
    });

    it('returns 401 when unauthenticated', function (): void {
        $this->postJson('/api/v1/auth/email/resend')
            ->assertUnauthorized();
    });

    it('returns 200 with message when email is already verified', function (): void {
        $user = User::factory()->create(); // verified by default
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/auth/email/resend')
            ->assertOk()
            ->assertJson(['message' => 'Email already verified']);
    });

    it('does not send notification when email is already verified', function (): void {
        Notification::fake();

        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/auth/email/resend');

        Notification::assertNothingSent();
    });
});
