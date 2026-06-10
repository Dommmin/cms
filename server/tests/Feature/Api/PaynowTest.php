<?php

declare(strict_types=1);

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusEnum;
use App\Infrastructure\Payments\Paynow\PaynowGateway;
use App\Infrastructure\Payments\Paynow\PaynowSignatureService;
use App\Jobs\ProcessPaymentWebhook;
use App\Models\Order;
use App\Models\Payment;
use App\States\Order\PaidState;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;

beforeEach(function (): void {
    Config::set('services.paynow.api_key', 'paynow-api-key');
    Config::set('services.paynow.signature_key', 'paynow-signature-key');
    Config::set('services.paynow.base_url', 'https://api.sandbox.paynow.pl');
    Notification::fake();
});

it('generates request and notification signatures', function (): void {
    $service = resolve(PaynowSignatureService::class);

    $signature = $service->signRequest('idem-1', '{"amount":100}', []);
    $notificationSignature = $service->signNotification('{"status":"CONFIRMED"}');

    expect($signature)->toBe(base64_encode(hash_hmac(
        'sha256',
        $service->requestPayload('idem-1', '{"amount":100}', []),
        'paynow-signature-key',
        true,
    )))
        ->and($service->verifyNotification('{"status":"CONFIRMED"}', $notificationSignature))->toBeTrue()
        ->and($service->verifyNotification('{"status":"REJECTED"}', $notificationSignature))->toBeFalse();
});

it('rejects paynow webhook with invalid signature', function (): void {
    Queue::fake();

    $this->withHeaders(['Signature' => 'invalid'])
        ->postJson('/api/v1/webhooks/paynow', [
            'paymentId' => 'NOLV-8F9-08K-WGD',
            'externalId' => '1',
            'status' => 'CONFIRMED',
        ])
        ->assertStatus(400);

    Queue::assertNotPushed(ProcessPaymentWebhook::class);
});

it('accepts paynow webhook with valid signature and dispatches job', function (): void {
    Queue::fake();

    $payload = [
        'paymentId' => 'NOLV-8F9-08K-WGD',
        'externalId' => '1',
        'status' => 'CONFIRMED',
        'modifiedAt' => '2026-05-26T10:00:00',
    ];
    $body = json_encode($payload, JSON_UNESCAPED_SLASHES);
    $signature = resolve(PaynowSignatureService::class)->signNotification((string) $body);

    $this->withHeaders(['Signature' => $signature])
        ->postJson('/api/v1/webhooks/paynow', $payload)
        ->assertOk()
        ->assertJsonPath('message', 'OK');

    Queue::assertPushed(ProcessPaymentWebhook::class, function ($job): bool {
        $reflection = new ReflectionClass($job);
        $prop = $reflection->getProperty('provider');

        return $prop->getValue($job) === 'paynow';
    });
});

it('creates paynow payment and stores redirect payload', function (): void {
    Http::fake([
        'https://api.sandbox.paynow.pl/v3/payments' => Http::response([
            'redirectUrl' => 'https://paywall.sandbox.paynow.pl/NOLV-8F9-08K-WGD',
            'paymentId' => 'NOLV-8F9-08K-WGD',
            'status' => 'NEW',
        ], 201),
    ]);

    $order = Order::factory()->create(['total' => 12345, 'currency_code' => 'PLN']);
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->pending()
        ->create([
            'amount' => 12345,
            'currency_code' => 'PLN',
            'provider_transaction_id' => null,
        ]);

    $result = resolve(PaynowGateway::class)->processPayment($payment, [
        'payment_method' => 'paynow',
        'continue_url' => 'https://example.test/checkout/pending?payment='.$payment->id,
    ]);

    expect($result['action'])->toBe('redirect')
        ->and($result['redirect_url'])->toBe('https://paywall.sandbox.paynow.pl/NOLV-8F9-08K-WGD')
        ->and($payment->fresh()->provider_transaction_id)->toBe('NOLV-8F9-08K-WGD');

    Http::assertSent(fn ($request): bool => $request->hasHeader('Api-Key', 'paynow-api-key')
        && str_starts_with((string) $request->header('Idempotency-Key')[0], 'paynow-create-'.$payment->id)
        && $request->hasHeader('Signature')
        && $request['amount'] === 12345
        && $request['externalId'] === (string) $payment->id);
});

it('sends paymentMethodId when provided', function (): void {
    Http::fake([
        'https://api.sandbox.paynow.pl/v3/payments' => Http::response([
            'redirectUrl' => 'https://paywall.sandbox.paynow.pl/PAY-PO-123',
            'paymentId' => 'PAY-PO-123',
            'status' => 'NEW',
        ], 201),
    ]);

    $order = Order::factory()->create(['total' => 5000, 'currency_code' => 'PLN']);
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->pending()
        ->create([
            'amount' => 5000,
            'currency_code' => 'PLN',
        ]);

    resolve(PaynowGateway::class)->processPayment($payment, [
        'payment_method' => 'paypo',
        'payment_method_id' => 3000,
        'continue_url' => 'https://example.test/checkout/pending?payment='.$payment->id,
    ]);

    Http::assertSent(fn ($request): bool => $request['paymentMethodId'] === 3000);
});

it('marks paynow payment completed idempotently from webhook payload', function (): void {
    $order = Order::factory()->awaitingPayment()->create();
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->pending()
        ->create([
            'provider_transaction_id' => 'NOLV-8F9-08K-WGD',
        ]);

    $gateway = resolve(PaynowGateway::class);
    $payload = [
        'paymentId' => 'NOLV-8F9-08K-WGD',
        'externalId' => (string) $payment->id,
        'status' => 'CONFIRMED',
    ];

    $gateway->handleWebhook($payload);
    $gateway->handleWebhook($payload);

    expect($payment->fresh()->status)->toBe(PaymentStatusEnum::COMPLETED)
        ->and($order->fresh()->status)->toBeInstanceOf(PaidState::class);
});

it('marks payment as failed when webhook status is REJECTED', function (): void {
    $order = Order::factory()->awaitingPayment()->create();
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->pending()
        ->create([
            'provider_transaction_id' => 'REJ-123',
        ]);

    $gateway = resolve(PaynowGateway::class);
    $gateway->handleWebhook([
        'paymentId' => 'REJ-123',
        'externalId' => (string) $payment->id,
        'status' => 'REJECTED',
    ]);

    expect($payment->fresh()->status)->toBe(PaymentStatusEnum::FAILED);
});

it('marks payment as failed when webhook status is EXPIRED', function (): void {
    $order = Order::factory()->awaitingPayment()->create();
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->pending()
        ->create([
            'provider_transaction_id' => 'EXP-456',
        ]);

    $gateway = resolve(PaynowGateway::class);
    $gateway->handleWebhook([
        'paymentId' => 'EXP-456',
        'externalId' => (string) $payment->id,
        'status' => 'EXPIRED',
    ]);

    expect($payment->fresh()->status)->toBe(PaymentStatusEnum::FAILED);
});

it('marks payment as failed when webhook status is ERROR', function (): void {
    $order = Order::factory()->awaitingPayment()->create();
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->pending()
        ->create([
            'provider_transaction_id' => 'ERR-789',
        ]);

    $gateway = resolve(PaynowGateway::class);
    $gateway->handleWebhook([
        'paymentId' => 'ERR-789',
        'externalId' => (string) $payment->id,
        'status' => 'ERROR',
    ]);

    expect($payment->fresh()->status)->toBe(PaymentStatusEnum::FAILED);
});

it('does not overwrite completed payment with failed status', function (): void {
    $order = Order::factory()->create(['status' => OrderStatusEnum::PAID->value]);
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->create([
            'status' => PaymentStatusEnum::COMPLETED->value,
            'provider_transaction_id' => 'COMP-999',
        ]);

    $gateway = resolve(PaynowGateway::class);
    $gateway->handleWebhook([
        'paymentId' => 'COMP-999',
        'externalId' => (string) $payment->id,
        'status' => 'REJECTED',
    ]);

    expect($payment->fresh()->status)->toBe(PaymentStatusEnum::COMPLETED);
});

it('leaves payment in pending when webhook status is NEW', function (): void {
    $order = Order::factory()->awaitingPayment()->create();
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->pending()
        ->create([
            'provider_transaction_id' => 'NEW-111',
        ]);

    $gateway = resolve(PaynowGateway::class);
    $gateway->handleWebhook([
        'paymentId' => 'NEW-111',
        'externalId' => (string) $payment->id,
        'status' => 'NEW',
    ]);

    expect($payment->fresh()->status)->toBe(PaymentStatusEnum::PENDING);
});

it('marks payment as failed when webhook status is ABANDONED', function (): void {
    $order = Order::factory()->awaitingPayment()->create();
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->pending()
        ->create([
            'provider_transaction_id' => 'ABN-222',
        ]);

    $gateway = resolve(PaynowGateway::class);
    $gateway->handleWebhook([
        'paymentId' => 'ABN-222',
        'externalId' => (string) $payment->id,
        'status' => 'ABANDONED',
    ]);

    expect($payment->fresh()->status)->toBe(PaymentStatusEnum::FAILED);
});

it('handles paynow api error without marking order as paid', function (): void {
    Http::fake([
        'https://api.sandbox.paynow.pl/v3/payments' => Http::response([
            'message' => 'Invalid request',
        ], 422),
    ]);

    $order = Order::factory()->create(['total' => 5000, 'currency_code' => 'PLN']);
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->pending()
        ->create([
            'amount' => 5000,
            'currency_code' => 'PLN',
        ]);

    $gateway = resolve(PaynowGateway::class);

    expect(fn (): array => $gateway->processPayment($payment, [
        'payment_method' => 'paynow',
    ]))->toThrow(RuntimeException::class, 'Paynow payment creation failed');

    expect($payment->fresh()->status)->toBe(PaymentStatusEnum::PENDING)
        ->and($order->fresh()->status)->not->toBe(OrderStatusEnum::PAID->value);
});

it('stores provider_transaction_id from webhook if missing on payment', function (): void {
    $order = Order::factory()->awaitingPayment()->create();
    $payment = Payment::factory()
        ->for($order)
        ->paynow()
        ->pending()
        ->create([
            'provider_transaction_id' => null,
        ]);

    $gateway = resolve(PaynowGateway::class);
    $gateway->handleWebhook([
        'paymentId' => 'WEBHOOK-ASSIGNED-ID',
        'externalId' => (string) $payment->id,
        'status' => 'CONFIRMED',
    ]);

    expect($payment->fresh()->provider_transaction_id)->toBe('WEBHOOK-ASSIGNED-ID')
        ->and($payment->fresh()->status)->toBe(PaymentStatusEnum::COMPLETED);
});

it('reports paynow payment configuration status in checkout methods', function (): void {
    Config::set('services.paynow.api_key');
    Config::set('services.paynow.signature_key');

    $this->getJson('/api/v1/checkout/payment-methods')
        ->assertOk()
        ->assertJsonFragment([
            'id' => 'paynow',
            'configured' => false,
            'missing_settings' => [
                'payments.paynow_api_key',
                'payments.paynow_signature_key',
            ],
        ]);
});
