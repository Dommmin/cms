<?php

declare(strict_types=1);

use App\Jobs\ProcessPaymentWebhook;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Queue;

// ---------------------------------------------------------------------------
// PayU webhooks
// ---------------------------------------------------------------------------

describe('PayU webhook', function () {
    it('rejects request with an invalid signature and returns 400', function () {
        Config::set('services.payu.md5_key', 'secret');

        $this->postJson('/api/v1/webhooks/payu',
            ['order' => ['orderId' => 'ORDER-1', 'status' => 'COMPLETED']],
            ['OpenPayu-Signature' => 'sender=checkout;signature=totally_wrong_sig;algorithm=MD5']
        )->assertStatus(400);
    });

    it('rejects request with missing signature header', function () {
        Config::set('services.payu.md5_key', 'secret');

        $this->postJson('/api/v1/webhooks/payu', [
            'order' => ['orderId' => 'ORDER-1', 'status' => 'COMPLETED'],
        ])->assertStatus(400);
    });

    it('accepts valid signature and dispatches ProcessPaymentWebhook job', function () {
        Queue::fake();
        Config::set('services.payu.md5_key', 'topsecret');

        $payload = ['order' => ['orderId' => 'ORDER-123', 'status' => 'COMPLETED']];
        $body = json_encode($payload);
        $sig = md5($body.'topsecret');

        $this->withHeaders([
            'OpenPayu-Signature' => "sender=checkout;signature={$sig};algorithm=MD5",
        ])->postJson('/api/v1/webhooks/payu', $payload)->assertOk();

        Queue::assertPushed(ProcessPaymentWebhook::class);
    });

    it('does not dispatch job when signature is invalid', function () {
        Queue::fake();
        Config::set('services.payu.md5_key', 'topsecret');

        $this->withHeaders([
            'OpenPayu-Signature' => 'sender=checkout;signature=badsig;algorithm=MD5',
        ])->postJson('/api/v1/webhooks/payu', ['order' => ['status' => 'COMPLETED']])
            ->assertStatus(400);

        Queue::assertNotPushed(ProcessPaymentWebhook::class);
    });

    it('returns 200 OK immediately after dispatching (PayU requires <10s response)', function () {
        Queue::fake();
        Config::set('services.payu.md5_key', 'key');

        $payload = ['order' => ['orderId' => 'O-1', 'status' => 'PENDING']];
        $body = json_encode($payload);
        $sig = md5($body.'key');

        $this->withHeaders([
            'OpenPayu-Signature' => "sender=checkout;signature={$sig};algorithm=MD5",
        ])->postJson('/api/v1/webhooks/payu', $payload)->assertOk()
            ->assertJsonPath('message', 'OK');
    });

    it('signature is case-sensitive — wrong case fails', function () {
        Config::set('services.payu.md5_key', 'key');
        $body = json_encode(['order' => ['status' => 'COMPLETED']]);
        $sig = strtoupper(md5($body.'key')); // correct MD5 but uppercased

        $this->withHeaders([
            'OpenPayu-Signature' => "sender=checkout;signature={$sig};algorithm=MD5",
        ])->postJson('/api/v1/webhooks/payu', json_decode($body, true))
            ->assertStatus(400);
    });
});

// ---------------------------------------------------------------------------
// P24 webhooks
// ---------------------------------------------------------------------------

describe('P24 webhook', function () {
    it('accepts any P24 webhook and dispatches ProcessPaymentWebhook job', function () {
        Queue::fake();

        $this->postJson('/api/v1/webhooks/p24', [
            'merchantId' => 12345,
            'posId' => 12345,
            'sessionId' => 'sess-abc',
            'amount' => 5000,
            'currency' => 'PLN',
            'orderId' => 999,
            'sign' => 'fakesignature',
        ])->assertOk()->assertJsonPath('message', 'OK');

        Queue::assertPushed(ProcessPaymentWebhook::class, function ($job) {
            // Verify the provider argument passed to the job
            $reflection = new ReflectionClass($job);
            $prop = $reflection->getProperty('provider');
            $prop->setAccessible(true);

            return $prop->getValue($job) === 'p24';
        });
    });

    it('P24 webhook is publicly accessible without authentication', function () {
        Queue::fake();

        // No auth header, no session — must still succeed
        $this->postJson('/api/v1/webhooks/p24', ['sessionId' => 'x', 'sign' => 'y'])
            ->assertOk();
    });
});
