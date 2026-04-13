<?php

declare(strict_types=1);

use App\Models\NotificationPreference;
use App\Models\User;

describe('Notification Preferences API', function (): void {
    it('requires authentication to get preferences', function (): void {
        $this->getJson('/api/v1/notification-preferences')
            ->assertUnauthorized();
    });

    it('requires authentication to update preferences', function (): void {
        $this->putJson('/api/v1/notification-preferences', [])
            ->assertUnauthorized();
    });

    it('returns default preferences (all enabled) when none saved', function (): void {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/notification-preferences')
            ->assertSuccessful();

        $prefs = $response->json('preferences');

        expect($prefs)->toBeArray();
        expect($prefs['order_status']['email'])->toBeTrue();
        expect($prefs['order_status']['sms'])->toBeTrue();
        expect($prefs['order_status']['push'])->toBeTrue();
        expect($prefs['promotions']['email'])->toBeTrue();
    });

    it('returns saved preferences correctly', function (): void {
        $user = User::factory()->create();

        NotificationPreference::query()->create([
            'user_id' => $user->id,
            'customer_id' => null,
            'channel' => 'sms',
            'event' => 'promotions',
            'is_enabled' => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/notification-preferences')
            ->assertSuccessful();

        $prefs = $response->json('preferences');

        expect($prefs['promotions']['sms'])->toBeFalse();
        expect($prefs['promotions']['email'])->toBeTrue(); // default
    });

    it('can update notification preferences in bulk', function (): void {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/notification-preferences', [
                'preferences' => [
                    ['channel' => 'email', 'event' => 'promotions', 'is_enabled' => false],
                    ['channel' => 'sms', 'event' => 'order_status', 'is_enabled' => false],
                ],
            ])
            ->assertSuccessful();

        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $user->id,
            'channel' => 'email',
            'event' => 'promotions',
            'is_enabled' => false,
        ]);

        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $user->id,
            'channel' => 'sms',
            'event' => 'order_status',
            'is_enabled' => false,
        ]);
    });

    it('updates existing preferences without duplicating', function (): void {
        $user = User::factory()->create();

        NotificationPreference::query()->create([
            'user_id' => $user->id,
            'customer_id' => null,
            'channel' => 'email',
            'event' => 'newsletter',
            'is_enabled' => true,
        ]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/notification-preferences', [
                'preferences' => [
                    ['channel' => 'email', 'event' => 'newsletter', 'is_enabled' => false],
                ],
            ])
            ->assertSuccessful();

        $this->assertDatabaseCount('notification_preferences', 1);
        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $user->id,
            'channel' => 'email',
            'event' => 'newsletter',
            'is_enabled' => false,
        ]);
    });

    it('rejects invalid channel values', function (): void {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/notification-preferences', [
                'preferences' => [
                    ['channel' => 'telegram', 'event' => 'order_status', 'is_enabled' => true],
                ],
            ])
            ->assertUnprocessable();
    });

    it('rejects invalid event values', function (): void {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/notification-preferences', [
                'preferences' => [
                    ['channel' => 'email', 'event' => 'nonexistent_event', 'is_enabled' => true],
                ],
            ])
            ->assertUnprocessable();
    });
});
