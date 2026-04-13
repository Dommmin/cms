<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\NewsletterSubscriber;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'customer']);

    $this->user = User::factory()->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => Hash::make('Password123!'),
    ]);

    $this->customer = Customer::factory()->create(['user_id' => $this->user->id]);
    $this->token = $this->user->createToken('api')->plainTextToken;
});

describe('GDPR Data Export (GET /api/v1/profile/export)', function (): void {
    it('returns 200 with full export structure', function (): void {
        $this->withToken($this->token)
            ->getJson('/api/v1/profile/export')
            ->assertOk()
            ->assertJsonStructure([
                'exported_at',
                'account',
                'profile',
                'orders',
                'reviews',
            ]);
    });

    it('requires authentication', function (): void {
        $this->getJson('/api/v1/profile/export')
            ->assertUnauthorized();
    });

    it('contains correct personal data in account section', function (): void {
        $this->withToken($this->token)
            ->getJson('/api/v1/profile/export')
            ->assertOk()
            ->assertJsonPath('account.email', 'jane@example.com')
            ->assertJsonPath('account.name', 'Jane Doe');
    });

    it('does not expose the password field', function (): void {
        $response = $this->withToken($this->token)
            ->getJson('/api/v1/profile/export')
            ->assertOk();

        $data = $response->json();
        expect($data)->not->toHaveKey('password');
        expect($data['account'] ?? [])->not->toHaveKey('password');
    });

    it('includes orders with items when user has orders', function (): void {
        Event::fake();

        $order = Order::factory()->create([
            'customer_id' => $this->customer->id,
        ]);

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/profile/export')
            ->assertOk();

        $orders = $response->json('orders');
        expect($orders)->toHaveCount(1);
        expect($orders[0])->toHaveKey('reference_number');
        expect($orders[0])->toHaveKey('items');
    });

    it('returns empty orders array when user has no orders', function (): void {
        $response = $this->withToken($this->token)
            ->getJson('/api/v1/profile/export')
            ->assertOk();

        expect($response->json('orders'))->toBeEmpty();
    });

    it('includes newsletter status when subscriber exists', function (): void {
        NewsletterSubscriber::query()->create([
            'customer_id' => $this->customer->id,
            'email' => 'jane@example.com',
            'is_active' => true,
            'token' => Str::uuid(),
        ]);

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/profile/export')
            ->assertOk();

        expect($response->json('newsletter'))->not->toBeNull();
    });

    it('returns null for newsletter when not subscribed', function (): void {
        $response = $this->withToken($this->token)
            ->getJson('/api/v1/profile/export')
            ->assertOk();

        expect($response->json('newsletter'))->toBeNull();
    });
});

describe('GDPR Right to Erasure (DELETE /api/v1/profile)', function (): void {
    it('deletes account successfully with correct password', function (): void {
        $this->withToken($this->token)
            ->deleteJson('/api/v1/profile', ['password' => 'Password123!'])
            ->assertOk()
            ->assertJson(['message' => 'Account deleted successfully']);
    });

    it('requires authentication', function (): void {
        $this->deleteJson('/api/v1/profile', ['password' => 'Password123!'])
            ->assertUnauthorized();
    });

    it('requires the password field', function (): void {
        $this->withToken($this->token)
            ->deleteJson('/api/v1/profile', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });

    it('rejects incorrect password with validation error', function (): void {
        $this->withToken($this->token)
            ->deleteJson('/api/v1/profile', ['password' => 'WrongPassword!'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    });

    it('soft-deletes the user after account deletion', function (): void {
        $userId = $this->user->id;

        $this->withToken($this->token)
            ->deleteJson('/api/v1/profile', ['password' => 'Password123!'])
            ->assertOk();

        $this->assertSoftDeleted('users', ['id' => $userId]);
    });

    it('anonymizes the user email after deletion', function (): void {
        $userId = $this->user->id;

        $this->withToken($this->token)
            ->deleteJson('/api/v1/profile', ['password' => 'Password123!'])
            ->assertOk();

        $this->assertDatabaseHas('users', [
            'id' => $userId,
            'email' => sprintf('deleted+%s@deleted.invalid', $userId),
        ]);
    });

    it('anonymizes the user name after deletion', function (): void {
        $userId = $this->user->id;

        $this->withToken($this->token)
            ->deleteJson('/api/v1/profile', ['password' => 'Password123!'])
            ->assertOk();

        $this->assertDatabaseHas('users', [
            'id' => $userId,
            'name' => 'Deleted User #'.$userId,
        ]);
    });

    it('revokes all tokens after deletion', function (): void {
        $userId = $this->user->id;

        $this->withToken($this->token)
            ->deleteJson('/api/v1/profile', ['password' => 'Password123!'])
            ->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $userId,
            'tokenable_type' => User::class,
        ]);
    });

    it('preserves orders after account deletion (legal obligation)', function (): void {
        Event::fake();

        $order = Order::factory()->create([
            'customer_id' => $this->customer->id,
        ]);

        $this->withToken($this->token)
            ->deleteJson('/api/v1/profile', ['password' => 'Password123!'])
            ->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id]);
    });

    it('unsubscribes newsletter subscriber after deletion', function (): void {
        NewsletterSubscriber::query()->create([
            'customer_id' => $this->customer->id,
            'email' => 'jane@example.com',
            'is_active' => true,
            'token' => Str::uuid(),
        ]);

        $this->withToken($this->token)
            ->deleteJson('/api/v1/profile', ['password' => 'Password123!'])
            ->assertOk();

        $this->assertDatabaseHas('newsletter_subscribers', [
            'customer_id' => $this->customer->id,
            'is_active' => false,
        ]);
    });

    it('soft-deletes the customer record after deletion', function (): void {
        $customerId = $this->customer->id;

        $this->withToken($this->token)
            ->deleteJson('/api/v1/profile', ['password' => 'Password123!'])
            ->assertOk();

        $this->assertSoftDeleted('customers', ['id' => $customerId]);
    });
});
