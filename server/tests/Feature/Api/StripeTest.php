<?php

declare(strict_types=1);

use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Infrastructure\Payments\Stripe\StripeCheckoutSessionService;
use App\Infrastructure\Payments\Stripe\StripeGateway;
use App\Jobs\ProcessPaymentWebhook;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\States\Order\PaidState;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

if (! function_exists('stripeWebhookSignature')) {
    function stripeWebhookSignature(string $payload, string $secret): string
    {
        $timestamp = time();
        $signedPayload = $timestamp.'.'.$payload;

        return sprintf(
            't=%d,v1=%s',
            $timestamp,
            hash_hmac('sha256', $signedPayload, $secret),
        );
    }
}

beforeEach(function (): void {
    Config::set('services.stripe.key', 'pk_test_stripe_key');
    Config::set('services.stripe.secret', 'sk_test_stripe_secret');
    Config::set('services.stripe.webhook_secret', 'whsec_test_stripe_secret');
    Config::set('cashier.key', 'pk_test_stripe_key');
    Config::set('cashier.secret', 'sk_test_stripe_secret');
    Config::set('cashier.webhook.secret', 'whsec_test_stripe_secret');
    Config::set('cashier.webhook.tolerance', 300);
});

it('exposes stripe payment method when configured', function (): void {
    $response = $this->getJson('/api/v1/checkout/payment-methods');

    $response->assertOk();

    $stripeMethod = collect($response->json())->firstWhere('id', 'stripe');

    expect($stripeMethod)->not->toBeNull()
        ->and($stripeMethod['configured'])->toBeTrue();
});

it('creates a stripe checkout session and stores the redirect payload', function (): void {
    $order = Order::factory()->create([
        'total' => 12_345,
        'currency_code' => 'PLN',
    ]);
    $payment = Payment::factory()
        ->for($order)
        ->stripe()
        ->pending()
        ->create([
            'amount' => 12_345,
            'currency_code' => 'PLN',
            'provider_transaction_id' => null,
            'payload' => null,
        ]);

    $service = Mockery::mock(StripeCheckoutSessionService::class);
    $service->shouldReceive('createSession')
        ->once()
        ->andReturn([
            'session_id' => 'cs_test_123',
            'url' => 'https://checkout.stripe.test/session',
            'payload' => [
                'id' => 'cs_test_123',
                'url' => 'https://checkout.stripe.test/session',
                'payment_intent' => 'pi_test_123',
            ],
        ]);

    $this->app->instance(StripeCheckoutSessionService::class, $service);

    $result = resolve(StripeGateway::class)->processPayment($payment, [
        'return_url' => 'https://example.test/checkout/pending?payment='.$payment->id,
        'continue_url' => 'https://example.test/checkout/pending?payment='.$payment->id,
    ]);

    expect($result['action'])->toBe('redirect')
        ->and($result['redirect_url'])->toBe('https://checkout.stripe.test/session')
        ->and($payment->fresh()->provider_transaction_id)->toBe('cs_test_123')
        ->and($payment->fresh()->payload['payment_intent'])->toBe('pi_test_123');
});

it('verifies pending stripe payments through checkout session retrieval', function (): void {
    $user = User::factory()->create();
    $customer = Customer::factory()->create(['user_id' => $user->id]);
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
    ]);
    $payment = Payment::factory()
        ->for($order)
        ->stripe()
        ->pending()
        ->create([
            'provider_transaction_id' => 'cs_test_123',
        ]);

    $service = Mockery::mock(StripeCheckoutSessionService::class);
    $service->shouldReceive('retrieveSession')
        ->once()
        ->with('cs_test_123')
        ->andReturn([
            'id' => 'cs_test_123',
            'status' => 'complete',
            'payment_status' => 'paid',
            'payment_intent' => 'pi_test_123',
            'metadata' => [
                'order_id' => (string) $order->id,
                'payment_id' => (string) $payment->id,
                'reference_number' => $order->reference_number,
            ],
        ]);

    $this->app->instance(StripeCheckoutSessionService::class, $service);

    $token = $user->createToken('api')->plainTextToken;

    $this->withToken($token)
        ->getJson(sprintf('/api/v1/payments/%s/status', $payment->id))
        ->assertOk()
        ->assertJson([
            'status' => PaymentStatusEnum::COMPLETED->value,
        ]);

    expect($payment->fresh()->status)->toBe(PaymentStatusEnum::COMPLETED)
        ->and($order->fresh()->status)->toBeInstanceOf(PaidState::class);
});

it('marks stripe webhook payloads as completed', function (): void {
    $order = Order::factory()->awaitingPayment()->create();
    $payment = Payment::factory()
        ->for($order)
        ->stripe()
        ->pending()
        ->create([
            'provider_transaction_id' => 'cs_test_123',
        ]);

    resolve(StripeGateway::class)->handleWebhook([
        'type' => 'checkout.session.completed',
        'data' => [
            'object' => [
                'id' => 'cs_test_123',
                'status' => 'complete',
                'payment_status' => 'paid',
                'payment_intent' => 'pi_test_123',
                'metadata' => [
                    'payment_id' => (string) $payment->id,
                    'order_id' => (string) $order->id,
                    'reference_number' => $order->reference_number,
                ],
            ],
        ],
    ]);

    expect($payment->fresh()->status)->toBe(PaymentStatusEnum::COMPLETED)
        ->and($order->fresh()->status)->toBeInstanceOf(PaidState::class);
});

it('accepts stripe webhooks with a valid signature and dispatches the processing job', function (): void {
    Queue::fake();

    $payload = [
        'type' => 'checkout.session.completed',
        'data' => [
            'object' => [
                'id' => 'cs_test_123',
                'status' => 'complete',
                'payment_status' => 'paid',
                'payment_intent' => 'pi_test_123',
                'metadata' => [
                    'payment_id' => '1',
                    'order_id' => '1',
                    'reference_number' => 'ORD-0001',
                ],
            ],
        ],
    ];
    $body = json_encode($payload, JSON_UNESCAPED_SLASHES);
    $signature = stripeWebhookSignature((string) $body, 'whsec_test_stripe_secret');

    $this->call(
        'POST',
        '/api/v1/webhooks/stripe',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_STRIPE_SIGNATURE' => $signature,
        ],
        $body,
    )->assertOk()
        ->assertJson([
            'message' => 'OK',
        ]);

    Queue::assertPushed(ProcessPaymentWebhook::class, function (ProcessPaymentWebhook $job): bool {
        $reflection = new ReflectionClass($job);
        $property = $reflection->getProperty('provider');

        return $property->getValue($job) === PaymentProviderEnum::STRIPE->value;
    });
});

it('delegates stripe refunds through the checkout session service', function (): void {
    $order = Order::factory()->create();
    $payment = Payment::factory()
        ->for($order)
        ->stripe()
        ->completed()
        ->create([
            'provider_transaction_id' => 'cs_test_123',
            'payload' => [
                'payment_intent' => 'pi_test_123',
            ],
        ]);

    $service = Mockery::mock(StripeCheckoutSessionService::class);
    $service->shouldReceive('refundPayment')
        ->once()
        ->with('pi_test_123', 2_500)
        ->andReturn(true);

    $this->app->instance(StripeCheckoutSessionService::class, $service);

    expect(resolve(StripeGateway::class)->refundPayment($payment, 2_500))->toBeTrue();
});
