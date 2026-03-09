<?php

declare(strict_types=1);

use App\Enums\NotificationChannelEnum;
use App\Enums\NotificationStatusEnum;
use App\Enums\NotificationTypeEnum;
use App\Models\AppNotification;
use App\Models\Customer;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);
});

it('renders notifications create page', function () {
    $customerUser = User::factory()->create();

    Customer::query()->create([
        'user_id' => $customerUser->id,
        'first_name' => 'Jan',
        'last_name' => 'Kowalski',
        'email' => 'jan@example.test',
    ]);

    $this->get('/admin/notifications/create')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/notifications/create')
            ->has('customers', 1)
            ->has('types')
            ->has('channels')
        );
});

it('stores app notification with pending status', function () {
    $customerUser = User::factory()->create();

    $customer = Customer::query()->create([
        'user_id' => $customerUser->id,
        'first_name' => 'Anna',
        'last_name' => 'Nowak',
        'email' => 'anna@example.test',
    ]);

    $this->post('/admin/notifications', [
        'customer_id' => $customer->id,
        'type' => NotificationTypeEnum::Welcome->value,
        'channel' => NotificationChannelEnum::Email->value,
    ])->assertRedirect('/admin/notifications')
        ->assertSessionHas('success', 'Powiadomienie zostało utworzone');

    $this->assertDatabaseHas('app_notifications', [
        'customer_id' => $customer->id,
        'type' => NotificationTypeEnum::Welcome->value,
        'channel' => NotificationChannelEnum::Email->value,
        'status' => NotificationStatusEnum::Pending->value,
    ]);

    $notification = AppNotification::query()->latest('id')->firstOrFail();

    $this->get("/admin/notifications/{$notification->id}")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('admin/notifications/show')
            ->where('notification.id', $notification->id)
            ->where('notification.customer.id', $customer->id)
        );
});
