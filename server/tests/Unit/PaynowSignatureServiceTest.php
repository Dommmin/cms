<?php

declare(strict_types=1);

use App\Infrastructure\Payments\Paynow\PaynowSignatureService;
use Tests\TestCase;

uses(TestCase::class);

describe('PaynowSignatureService', function (): void {
    beforeEach(function (): void {
        config([
            'services.paynow.api_key' => 'test-api-key',
            'services.paynow.signature_key' => 'test-signature-key',
        ]);
        $this->service = resolve(PaynowSignatureService::class);
    });

    it('signs a request payload with HMAC-SHA256 Base64', function (): void {
        $signature = $this->service->signRequest('idem-1', '{"amount":12345}', []);

        $expectedPayload = $this->service->requestPayload('idem-1', '{"amount":12345}', []);
        $expected = base64_encode(hash_hmac('sha256', $expectedPayload, 'test-signature-key', true));

        expect($signature)->toBe($expected);
    });

    it('includes api_key and idempotency_key in request payload headers', function (): void {
        $payload = $this->service->requestPayload('my-idem-key', '{"amount":1}', []);

        $decoded = json_decode($payload, true);
        expect($decoded['headers']['Api-Key'])->toBe('test-api-key')
            ->and($decoded['headers']['Idempotency-Key'])->toBe('my-idem-key');
    });

    it('sorts parameters alphabetically in request payload', function (): void {
        $payload = $this->service->requestPayload('idem-1', '{}', ['zee' => '1', 'alpha' => '2']);

        $decoded = json_decode($payload, true);
        $keys = array_keys((array) $decoded['parameters']);
        expect($keys)->toBe(['alpha', 'zee']);
    });

    it('signs a notification body', function (): void {
        $body = '{"paymentId":"ABC-123","status":"CONFIRMED"}';
        $signature = $this->service->signNotification($body);

        $expected = base64_encode(hash_hmac('sha256', $body, 'test-signature-key', true));
        expect($signature)->toBe($expected);
    });

    it('verifies a valid notification signature', function (): void {
        $body = '{"paymentId":"ABC-123","status":"CONFIRMED"}';
        $signature = $this->service->signNotification($body);

        expect($this->service->verifyNotification($body, $signature))->toBeTrue();
    });

    it('rejects a tampered body with the original signature', function (): void {
        $original = '{"paymentId":"ABC-123","status":"CONFIRMED"}';
        $tampered = '{"paymentId":"ABC-123","status":"REJECTED"}';
        $signature = $this->service->signNotification($original);

        expect($this->service->verifyNotification($tampered, $signature))->toBeFalse();
    });

    it('rejects an empty signature', function (): void {
        expect($this->service->verifyNotification('body', ''))->toBeFalse();
    });

    it('rejects a wrong signature', function (): void {
        expect($this->service->verifyNotification('body', 'invalid-signature'))->toBeFalse();
    });

    it('uses hash_equals for timing-safe comparison', function (): void {
        $body = 'payload';
        $correct = $this->service->signNotification($body);
        $wrong = str_repeat('x', mb_strlen($correct));

        // If hash_equals is used, the function must not throw and return false
        // for equal-length but different strings — timing-safe comparison.
        expect($this->service->verifyNotification($body, $wrong))->toBeFalse();
    });

    it('produces deterministic signatures for identical inputs', function (): void {
        $sig1 = $this->service->signRequest('idem-1', '{"amount":100}', []);
        $sig2 = $this->service->signRequest('idem-1', '{"amount":100}', []);

        expect($sig1)->toBe($sig2);
    });
});
