<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\P24;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use App\Models\Payment;

class P24Gateway implements PaymentGatewayInterface
{
    public function __construct(
        private readonly P24Client $client,
        private readonly P24SignatureService $signatureService
    ) {}

    public function createPayment(Order $order, array $data = []): Payment
    {
        return Payment::query()->create([
            'order_id' => $order->id,
            'provider' => PaymentProviderEnum::P24->value,
            'payment_method' => $data['payment_method'] ?? null,
            'provider_transaction_id' => null,
            'status' => PaymentStatusEnum::PENDING->value,
            'amount' => $order->total,
            'currency_code' => $order->currency_code,
            'payload' => null,
        ]);
    }

    /**
     * @return array{action: 'redirect'|'wait'|'none', redirect_url: string|null, message: string}
     */
    public function processPayment(Payment $payment, array $options = []): array
    {
        $order = $payment->order;
        $sessionId = "p24-{$payment->id}";
        $merchantId = (int) config('services.p24.merchant_id');
        $posId = (int) config('services.p24.pos_id');
        $currency = mb_strtoupper($payment->currency_code);
        $returnUrl = $options['return_url'] ?? config('app.frontend_url').'/checkout/success';
        $notifyUrl = config('app.url').'/api/v1/webhooks/p24';

        $address = $order->billingAddress ?? $order->shippingAddress;

        $sign = $this->signatureService->signTransaction([
            'merchantId' => $merchantId,
            'posId' => $posId,
            'sessionId' => $sessionId,
            'amount' => $payment->amount,
            'currency' => $currency,
        ]);

        $data = [
            'merchantId' => $merchantId,
            'posId' => $posId,
            'sessionId' => $sessionId,
            'amount' => $payment->amount,
            'currency' => $currency,
            'description' => 'Zamówienie #'.($order->reference_number ?? $order->id),
            'email' => $order->customer?->email ?? '',
            'client' => mb_trim(($address?->first_name ?? '').' '.($address?->last_name ?? '')),
            'phone' => $address?->phone ?? '',
            'country' => $address?->country_code ?? 'PL',
            'urlReturn' => $returnUrl,
            'urlStatus' => $notifyUrl,
            'sign' => $sign,
            'encoding' => 'UTF-8',
        ];

        $response = $this->client->registerTransaction($data);

        $token = $response['data']['token'] ?? null;

        if ($token) {
            $redirectUrl = config('services.p24.base_url').'/trnRequest/'.$token;
            $payment->update([
                'provider_transaction_id' => $sessionId,
                'payload' => $response,
            ]);

            return ['action' => 'redirect', 'redirect_url' => $redirectUrl, 'message' => 'Redirect to Przelewy24'];
        }

        return ['action' => 'redirect', 'redirect_url' => null, 'message' => 'P24 registration failed'];
    }

    public function verifyPayment(Payment $payment): bool
    {
        return $payment->status === PaymentStatusEnum::COMPLETED;
    }

    public function refundPayment(Payment $payment, int $amount): bool
    {
        if (! $payment->provider_transaction_id) {
            return false;
        }

        $data = [
            'requestId' => uniqid('refund_', true),
            'refunds' => [
                [
                    'sessionId' => $payment->provider_transaction_id,
                    'refundId' => uniqid('r_', true),
                    'amount' => $amount,
                ],
            ],
        ];

        $response = $this->client->createRefund($data);

        return isset($response['data']);
    }

    public function handleWebhook(array $payload): void
    {
        $sessionId = $payload['sessionId'] ?? null;
        $orderId = $payload['orderId'] ?? null;
        $amount = $payload['amount'] ?? null;
        $currency = $payload['currency'] ?? 'PLN';
        $sign = $payload['sign'] ?? null;

        if (! $sessionId || ! $orderId || ! $sign) {
            return;
        }

        /** @var Payment|null $payment */
        $payment = Payment::query()->where('provider_transaction_id', $sessionId)->first();

        if (! $payment) {
            return;
        }

        $merchantId = (int) config('services.p24.merchant_id');
        $posId = (int) config('services.p24.pos_id');

        $expected = $this->signatureService->signVerify([
            'merchantId' => $merchantId,
            'posId' => $posId,
            'sessionId' => $sessionId,
            'orderId' => $orderId,
            'amount' => $amount,
            'currency' => mb_strtoupper($currency),
        ]);

        if (! $this->signatureService->verify($expected, $sign)) {
            return;
        }

        $verifySign = $this->signatureService->signVerify([
            'merchantId' => $merchantId,
            'posId' => $posId,
            'sessionId' => $sessionId,
            'orderId' => $orderId,
            'amount' => $amount,
            'currency' => mb_strtoupper($currency),
        ]);

        $verifyResponse = $this->client->verifyTransaction([
            'merchantId' => $merchantId,
            'posId' => $posId,
            'sessionId' => $sessionId,
            'orderId' => $orderId,
            'amount' => $amount,
            'currency' => mb_strtoupper($currency),
            'sign' => $verifySign,
        ]);

        $status = $verifyResponse['data']['status'] ?? -1;

        if ($status === 0) {
            $payment->update(['status' => PaymentStatusEnum::COMPLETED->value]);

            $order = $payment->order;
            if ($order && $order->status !== OrderStatusEnum::PAID) {
                $order->update(['status' => OrderStatusEnum::PAID->value]);
            }
        } else {
            $payment->update(['status' => PaymentStatusEnum::FAILED->value]);
        }
    }
}
