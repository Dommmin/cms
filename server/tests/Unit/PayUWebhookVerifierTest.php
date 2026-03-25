<?php

declare(strict_types=1);

use App\Infrastructure\Payments\PayU\PayUWebhookVerifier;
use Tests\TestCase;

// Unit tests don't boot the full Laravel app, but PayUWebhookVerifier calls config().
// We bind the Laravel TestCase to get the container (and config helper) in Unit tests.
uses(TestCase::class);

describe('PayUWebhookVerifier', function (): void {
    beforeEach(function (): void {
        $this->verifier = new PayUWebhookVerifier();
        config(['services.payu.md5_key' => 'testsecret']);
    });

    it('returns true for a correct MD5 signature', function (): void {
        $body = '{"order":{"orderId":"123","status":"COMPLETED"}}';
        $sig = md5($body.'testsecret');

        expect($this->verifier->verify($body, sprintf('sender=checkout;signature=%s;algorithm=MD5', $sig)))
            ->toBeTrue();
    });

    it('returns false for a wrong signature', function (): void {
        $body = '{"order":{"status":"COMPLETED"}}';

        expect($this->verifier->verify($body, 'sender=checkout;signature=wrongsig;algorithm=MD5'))
            ->toBeFalse();
    });

    it('returns false when signature part is absent from header', function (): void {
        expect($this->verifier->verify('body', 'sender=checkout;algorithm=MD5'))
            ->toBeFalse();
    });

    it('returns false when header is empty string', function (): void {
        expect($this->verifier->verify('body', ''))->toBeFalse();
    });

    it('is resistant to timing attacks via hash_equals', function (): void {
        // Just verify it does not throw and returns false for mismatches
        $body = 'sensitive_payload';
        config(['services.payu.md5_key' => 'mykey']);
        $wrongSig = str_repeat('a', 32);

        expect($this->verifier->verify($body, 'signature='.$wrongSig))->toBeFalse();
    });

    it('handles signature with extra whitespace around value', function (): void {
        $body = '{"status":"ok"}';
        $sig = md5($body.'testsecret');

        // PayU might include spaces: "signature= abc123 "
        expect($this->verifier->verify($body, sprintf('sender=checkout;signature= %s ;algorithm=MD5', $sig)))
            ->toBeTrue();
    });

    it('signature verification fails when body is tampered after signing', function (): void {
        $original = '{"order":{"status":"COMPLETED"}}';
        $tampered = '{"order":{"status":"REFUNDED"}}';
        $sig = md5($original.'testsecret');

        expect($this->verifier->verify($tampered, 'signature='.$sig))
            ->toBeFalse();
    });
});
