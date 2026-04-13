<?php

declare(strict_types=1);

use App\Models\CustomerNotification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('NotificationCenter – authentication', function (): void {
    it('requires auth for listing notifications', function (): void {
        $this->getJson('/api/v1/notifications')->assertUnauthorized();
    });

    it('requires auth for unread count', function (): void {
        $this->getJson('/api/v1/notifications/unread-count')->assertUnauthorized();
    });
});

describe('NotificationCenter – list', function (): void {
    it('returns paginated notifications for the authenticated user', function (): void {
        $user = User::factory()->create();
        CustomerNotification::factory()->count(3)->for($user)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/notifications')
            ->assertSuccessful();

        $response->assertJsonPath('meta.total', 3);
        $response->assertJsonCount(3, 'data');
    });

    it('does not return notifications belonging to another user', function (): void {
        $user = User::factory()->create();
        $other = User::factory()->create();
        CustomerNotification::factory()->count(2)->for($other)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/notifications')
            ->assertSuccessful();

        $response->assertJsonPath('meta.total', 0);
    });
});

describe('NotificationCenter – mark as read', function (): void {
    it('marks a notification as read', function (): void {
        $user = User::factory()->create();
        $notification = CustomerNotification::factory()->unread()->for($user)->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/notifications/%s/read', $notification->id))
            ->assertSuccessful()
            ->assertJsonPath('read_at', fn ($v): bool => $v !== null);

        expect($notification->fresh()->read_at)->not->toBeNull();
    });

    it("forbids marking another user's notification as read", function (): void {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $notification = CustomerNotification::factory()->for($other)->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(sprintf('/api/v1/notifications/%s/read', $notification->id))
            ->assertForbidden();
    });
});

describe('NotificationCenter – mark all as read', function (): void {
    it('marks all unread notifications as read', function (): void {
        $user = User::factory()->create();
        CustomerNotification::factory()->count(3)->unread()->for($user)->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/notifications/read-all')
            ->assertNoContent();

        $remaining = CustomerNotification::query()
            ->where('user_id', $user->id)
            ->unread()
            ->count();

        expect($remaining)->toBe(0);
    });
});

describe('NotificationCenter – unread count', function (): void {
    it('returns the number of unread notifications', function (): void {
        $user = User::factory()->create();
        CustomerNotification::factory()->count(2)->unread()->for($user)->create();
        CustomerNotification::factory()->read()->for($user)->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/notifications/unread-count')
            ->assertSuccessful()
            ->assertJsonPath('count', 2);
    });
});

describe('CustomerNotification – model scopes', function (): void {
    it('unread scope returns only notifications without read_at', function (): void {
        $user = User::factory()->create();
        CustomerNotification::factory()->count(2)->unread()->for($user)->create();
        CustomerNotification::factory()->read()->for($user)->create();

        $count = CustomerNotification::query()
            ->where('user_id', $user->id)
            ->unread()
            ->count();

        expect($count)->toBe(2);
    });

    it('markAsRead sets read_at timestamp', function (): void {
        $user = User::factory()->create();
        $notification = CustomerNotification::factory()->unread()->for($user)->create();

        expect($notification->read_at)->toBeNull();

        $notification->markAsRead();

        expect($notification->fresh()->read_at)->not->toBeNull();
    });
});
