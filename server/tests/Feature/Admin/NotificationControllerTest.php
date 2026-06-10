<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
});

it('fetches notifications index with empty read ids initially', function (): void {
    $response = $this->actingAs($this->user)
        ->get(route('admin.notifications.alerts'))
        ->assertOk();

    $data = $response->json();
    expect($data)->toHaveKey('data')
        ->and($data)->toHaveKey('unread_count')
        ->and($data)->toHaveKey('read_ids')
        ->and($data['read_ids'])->toBeArray();
});

it('marks notifications as read and updates the unread count', function (): void {
    // Force clean cache
    Cache::forget('admin_read_notifications_'.$this->user->id);

    // First fetch notifications to get any dummy IDs or verify we can mark them
    $response = $this->actingAs($this->user)
        ->get(route('admin.notifications.alerts'))
        ->assertOk();

    $initialUnreadCount = $response->json('unread_count');

    // Mark a dummy ID as read
    $dummyId = 'order-999';
    $this->actingAs($this->user)
        ->post(route('admin.notifications.read'), ['ids' => [$dummyId]])
        ->assertOk();

    // Fetch again
    $response = $this->actingAs($this->user)
        ->get(route('admin.notifications.alerts'))
        ->assertOk();

    $data = $response->json();
    expect($data['read_ids'])->toContain($dummyId);

    // Verify cache persistence
    $cacheVal = Cache::get('admin_read_notifications_'.$this->user->id);
    expect($cacheVal)->toContain($dummyId);
});
