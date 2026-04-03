<?php

declare(strict_types=1);

use App\Enums\PaymentStatusEnum;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'customer']);
    Currency::query()->firstOrCreate([
        'code' => 'PLN',
    ], [
        'name' => 'Polish Zloty',
        'symbol' => 'zł',
        'decimal_places' => 2,
        'is_active' => true,
        'is_base' => true,
    ]);
});

describe('Payment Status', function (): void {
    it('returns payment status for authenticated user', function (): void {
        $user = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $user->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::COMPLETED,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson(sprintf('/api/v1/payments/%s/status', $payment->id));

        $response->assertOk()
            ->assertJson([
                'status' => 'completed',
                'order_reference' => $order->reference_number,
            ]);
    });

    it('rejects access to other user payment', function (): void {
        $user1 = User::factory()->create();
        $customer1 = Customer::factory()->create(['user_id' => $user1->id]);
        $order1 = Order::factory()->create(['customer_id' => $customer1->id]);
        $payment1 = Payment::factory()->create(['order_id' => $order1->id]);

        $user2 = User::factory()->create();
        $token2 = $user2->createToken('api')->plainTextToken;

        $response = $this->withToken($token2)
            ->getJson(sprintf('/api/v1/payments/%s/status', $payment1->id));

        $response->assertStatus(403);
    });

    it('requires authentication', function (): void {
        $payment = Payment::factory()->create();

        $response = $this->getJson(sprintf('/api/v1/payments/%s/status', $payment->id));

        $response->assertStatus(401);
    });

    it('returns 404 for non-existent payment', function (): void {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/payments/999999/status');

        $response->assertStatus(404);
    });

    it('returns pending status correctly', function (): void {
        $user = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $user->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::PENDING,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson(sprintf('/api/v1/payments/%s/status', $payment->id));

        $response->assertOk()
            ->assertJson(['status' => 'pending']);
    });

    it('returns failed status correctly', function (): void {
        $user = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $user->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::FAILED,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson(sprintf('/api/v1/payments/%s/status', $payment->id));

        $response->assertOk()
            ->assertJson(['status' => 'failed']);
    });
});
