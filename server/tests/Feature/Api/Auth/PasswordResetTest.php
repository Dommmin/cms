<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'customer']);
});

describe('Forgot Password', function (): void {
    it('sends reset link email for existing user', function (): void {
        Notification::fake();

        $user = User::factory()->create(['email' => 'user@example.com']);

        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'user@example.com',
        ])->assertOk()->assertJsonStructure(['message']);

        Notification::assertSentTo($user, ResetPassword::class);
    });

    it('returns 422 when email field is missing', function (): void {
        $this->postJson('/api/v1/auth/forgot-password', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });

    it('returns 422 for invalid email format', function (): void {
        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'not-an-email',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });

    it('returns 422 for non-existent email', function (): void {
        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'nobody@example.com',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });
});

describe('Reset Password', function (): void {
    it('resets password successfully and deletes all tokens', function (): void {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('OldPassword1!'),
        ]);

        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'user@example.com',
            'password' => 'NewPassword1!',
            'password_confirmation' => 'NewPassword1!',
        ])->assertOk()->assertJsonStructure(['message']);

        expect(Hash::check('NewPassword1!', $user->fresh()->password))->toBeTrue();

        // All Sanctum tokens should be revoked after password reset
        expect($user->fresh()->tokens()->count())->toBe(0);
    });

    it('returns 422 with invalid token', function (): void {
        User::factory()->create(['email' => 'user@example.com']);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'invalid-token',
            'email' => 'user@example.com',
            'password' => 'NewPassword1!',
            'password_confirmation' => 'NewPassword1!',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });

    it('returns 422 when password is too weak', function (): void {
        $user = User::factory()->create(['email' => 'user@example.com']);
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'user@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });

    it('returns 422 when passwords do not match', function (): void {
        $user = User::factory()->create(['email' => 'user@example.com']);
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'user@example.com',
            'password' => 'NewPassword1!',
            'password_confirmation' => 'DifferentPassword1!',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });

    it('returns 422 when required fields are missing', function (): void {
        $this->postJson('/api/v1/auth/reset-password', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['token', 'email', 'password']);
    });

    it('returns 422 when token is missing', function (): void {
        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'user@example.com',
            'password' => 'NewPassword1!',
            'password_confirmation' => 'NewPassword1!',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['token']);
    });
});
