<?php

declare(strict_types=1);

use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Infrastructure\Payments\P24\P24Client;
use App\Interfaces\PaymentGatewayInterface;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaymentGatewayManager;
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

    it('triggers gateway verification when status is pending', function (): void {
        $user = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $user->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::PENDING,
            'provider' => PaymentProviderEnum::PAYNOW,
            'provider_transaction_id' => 'TX-12345',
        ]);

        $mockGateway = Mockery::mock(PaymentGatewayInterface::class);
        $mockGateway->shouldReceive('verifyPayment')
            ->once()
            ->with(Mockery::on(fn ($arg): bool => $arg->id === $payment->id))
            ->andReturnUsing(function ($payment): true {
                $payment->update(['status' => PaymentStatusEnum::COMPLETED]);

                return true;
            });

        $gatewayManager = Mockery::mock(PaymentGatewayManager::class);
        $gatewayManager->shouldReceive('driver')
            ->with(PaymentProviderEnum::PAYNOW)
            ->andReturn($mockGateway);

        $this->app->instance(PaymentGatewayManager::class, $gatewayManager);

        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson(sprintf('/api/v1/payments/%s/status', $payment->id));

        $response->assertOk()
            ->assertJson([
                'status' => 'completed',
            ]);

        expect($payment->fresh()->status)->toBe(PaymentStatusEnum::COMPLETED);
    });

    it('P24 verification transitions to completed when API status is 2', function (): void {
        $user = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $user->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::PENDING,
            'provider' => PaymentProviderEnum::P24,
            'provider_transaction_id' => 'p24-session-id',
        ]);

        $mockClient = Mockery::mock(P24Client::class);
        $mockClient->shouldReceive('getTransactionBySessionId')
            ->once()
            ->with('p24-session-id')
            ->andReturn([
                'data' => [
                    'status' => 2,
                    'orderId' => 9999,
                    'amount' => $payment->amount,
                    'currency' => 'PLN',
                ],
            ]);

        $this->app->instance(P24Client::class, $mockClient);

        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson(sprintf('/api/v1/payments/%s/status', $payment->id));

        $response->assertOk()
            ->assertJson([
                'status' => 'completed',
            ]);

        expect($payment->fresh()->status)->toBe(PaymentStatusEnum::COMPLETED);
    });

    it('P24 verification transitions to failed when API status is 3', function (): void {
        $user = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $user->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::PENDING,
            'provider' => PaymentProviderEnum::P24,
            'provider_transaction_id' => 'p24-session-id-failed',
        ]);

        $mockClient = Mockery::mock(P24Client::class);
        $mockClient->shouldReceive('getTransactionBySessionId')
            ->once()
            ->with('p24-session-id-failed')
            ->andReturn([
                'data' => [
                    'status' => 3,
                    'orderId' => 9999,
                    'amount' => $payment->amount,
                    'currency' => 'PLN',
                ],
            ]);

        $this->app->instance(P24Client::class, $mockClient);

        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson(sprintf('/api/v1/payments/%s/status', $payment->id));

        $response->assertOk()
            ->assertJson([
                'status' => 'failed',
            ]);

        expect($payment->fresh()->status)->toBe(PaymentStatusEnum::FAILED);
    });

    it('P24 verification transitions to failed when API status is 0', function (): void {
        $user = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $user->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::PENDING,
            'provider' => PaymentProviderEnum::P24,
            'provider_transaction_id' => 'p24-session-id-not-paid',
        ]);

        $mockClient = Mockery::mock(P24Client::class);
        $mockClient->shouldReceive('getTransactionBySessionId')
            ->once()
            ->with('p24-session-id-not-paid')
            ->andReturn([
                'data' => [
                    'status' => 0,
                    'orderId' => 9999,
                    'amount' => $payment->amount,
                    'currency' => 'PLN',
                ],
            ]);

        $this->app->instance(P24Client::class, $mockClient);

        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson(sprintf('/api/v1/payments/%s/status', $payment->id));

        $response->assertOk()
            ->assertJson([
                'status' => 'failed',
            ]);

        expect($payment->fresh()->status)->toBe(PaymentStatusEnum::FAILED);
    });

    it('P24 verification transitions to failed when transaction API fails/404 and is older than 3 minutes', function (): void {
        $user = User::factory()->create();
        $customer = Customer::factory()->create(['user_id' => $user->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);

        // Travel back in time by 4 minutes to make payment expired
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::PENDING,
            'provider' => PaymentProviderEnum::P24,
            'provider_transaction_id' => 'p24-session-id-timeout',
            'created_at' => now()->subMinutes(4),
        ]);

        $mockClient = Mockery::mock(P24Client::class);
        $mockClient->shouldReceive('getTransactionBySessionId')
            ->once()
            ->with('p24-session-id-timeout')
            ->andThrow(new RuntimeException('Transaction not found', 404));

        $this->app->instance(P24Client::class, $mockClient);

        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson(sprintf('/api/v1/payments/%s/status', $payment->id));

        $response->assertOk()
            ->assertJson([
                'status' => 'failed',
            ]);

        expect($payment->fresh()->status)->toBe(PaymentStatusEnum::FAILED);
    });
});
