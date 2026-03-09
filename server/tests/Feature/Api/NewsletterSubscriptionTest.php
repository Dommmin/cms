<?php

declare(strict_types=1);

use App\Models\NewsletterSubscriber;
use App\Notifications\NewsletterConfirmationNotification;
use App\Notifications\NewsletterWelcomeNotification;
use Illuminate\Support\Facades\Notification;

test('user can subscribe with valid email', function () {
    Notification::fake();

    $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'test@example.com'])
        ->assertCreated()
        ->assertJsonFragment(['message' => 'Please check your email to confirm your subscription.']);

    expect(NewsletterSubscriber::query()->where('email', 'test@example.com')->exists())->toBeTrue();
});

test('subscriber is created as inactive until confirmed', function () {
    Notification::fake();

    $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'pending@example.com'])
        ->assertCreated();

    $subscriber = NewsletterSubscriber::query()->where('email', 'pending@example.com')->first();
    expect($subscriber->is_active)->toBeFalse()
        ->and($subscriber->consent_given)->toBeFalse()
        ->and($subscriber->token)->not->toBeNull();
});

test('confirmation email is sent on subscribe', function () {
    Notification::fake();

    $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'notify@example.com'])
        ->assertCreated();

    Notification::assertSentOnDemand(NewsletterConfirmationNotification::class);
});

test('subscriber is activated after confirming token', function () {
    Notification::fake();

    $subscriber = NewsletterSubscriber::query()->create([
        'email' => 'confirm@example.com',
        'token' => 'test-token-123',
        'is_active' => false,
        'consent_given' => false,
    ]);

    $this->getJson('/api/v1/newsletter/confirm/test-token-123')
        ->assertOk()
        ->assertJsonFragment(['message' => 'Your subscription has been confirmed. Welcome!']);

    $subscriber->refresh();
    expect($subscriber->is_active)->toBeTrue()
        ->and($subscriber->consent_given)->toBeTrue()
        ->and($subscriber->consent_given_at)->not->toBeNull();
});

test('welcome email is sent after confirmation', function () {
    Notification::fake();

    NewsletterSubscriber::query()->create([
        'email' => 'welcome@example.com',
        'token' => 'welcome-token',
        'is_active' => false,
        'consent_given' => false,
    ]);

    $this->getJson('/api/v1/newsletter/confirm/welcome-token')->assertOk();

    Notification::assertSentOnDemand(NewsletterWelcomeNotification::class);
});

test('confirmation with invalid token returns 404', function () {
    $this->getJson('/api/v1/newsletter/confirm/invalid-token-xyz')
        ->assertNotFound();
});

test('user can unsubscribe by email', function () {
    $subscriber = NewsletterSubscriber::query()->create([
        'email' => 'leave@example.com',
        'token' => 'leave-token',
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/newsletter/unsubscribe', ['email' => 'leave@example.com'])
        ->assertOk()
        ->assertJsonFragment(['message' => 'Successfully unsubscribed from the newsletter']);

    $subscriber->refresh();
    expect($subscriber->is_active)->toBeFalse();
});

test('user can unsubscribe by token', function () {
    $subscriber = NewsletterSubscriber::query()->create([
        'email' => 'bytoken@example.com',
        'token' => 'bytoken-token',
        'is_active' => true,
    ]);

    $this->getJson('/api/v1/newsletter/unsubscribe/bytoken-token')
        ->assertOk();

    $subscriber->refresh();
    expect($subscriber->is_active)->toBeFalse();
});

test('subscribe requires valid email', function () {
    $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'not-an-email'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('resubscribing with existing email resends confirmation', function () {
    Notification::fake();

    NewsletterSubscriber::query()->create([
        'email' => 'existing@example.com',
        'token' => 'old-token',
        'is_active' => false,
    ]);

    $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'existing@example.com'])
        ->assertCreated();

    // Should not create a duplicate
    expect(NewsletterSubscriber::query()->where('email', 'existing@example.com')->count())->toBe(1);
    Notification::assertSentOnDemand(NewsletterConfirmationNotification::class);
});
