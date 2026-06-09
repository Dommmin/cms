<?php

declare(strict_types=1);

use App\Mail\OtpLoginMail;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

beforeEach(function (): void {
    Mail::fake();
    Cache::flush();
});

it('sends an OTP code via email and stores it in cache', function (): void {
    $email = 'test-otp@example.com';

    $response = $this->postJson('/api/v1/auth/otp/send', [
        'email' => $email,
    ]);

    $response->assertOk()
        ->assertJsonPath('message', 'Verification code sent.');

    $storedCode = Cache::get('otp_login_'.$email);
    expect($storedCode)->not->toBeNull();
    expect(mb_strlen((string) $storedCode))->toBe(6);

    Mail::assertSent(OtpLoginMail::class, fn ($mail): bool => $mail->hasTo($email) && $mail->code === $storedCode);
});

it('authenticates an existing user and returns a token on correct OTP', function (): void {
    $user = User::factory()->create([
        'email' => 'existing@example.com',
    ]);

    Cache::put('otp_login_'.$user->email, '123456', now()->addMinutes(5));

    $response = $this->postJson('/api/v1/auth/otp/verify', [
        'email' => $user->email,
        'code' => '123456',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email'],
            'token',
        ])
        ->assertJsonPath('user.email', $user->email);

    expect(Cache::has('otp_login_'.$user->email))->toBeFalse();
});

it('creates a new user dynamically and returns a token on correct OTP', function (): void {
    $email = 'dynamic-signup@example.com';
    expect(User::query()->where('email', $email)->exists())->toBeFalse();

    Cache::put('otp_login_'.$email, '654321', now()->addMinutes(5));

    $response = $this->postJson('/api/v1/auth/otp/verify', [
        'email' => $email,
        'code' => '654321',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email'],
            'token',
        ])
        ->assertJsonPath('user.email', $email);

    expect(User::query()->where('email', $email)->exists())->toBeTrue();
    expect(Cache::has('otp_login_'.$email))->toBeFalse();
});

it('rejects an incorrect OTP code', function (): void {
    $email = 'incorrect@example.com';
    Cache::put('otp_login_'.$email, '111111', now()->addMinutes(5));

    $response = $this->postJson('/api/v1/auth/otp/verify', [
        'email' => $email,
        'code' => '222222',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['code']);
});
