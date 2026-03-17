<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\PayU;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use App\Models\Payment;
use RuntimeException;

class PayUGateway implements PaymentGatewayInterface
{
    public function __construct(
        private readonly PayUClient $client,
        private readonly PayUWebhookVerifier $verifier
    ) {}

    public function createPayment(Order $order, array $data = []): Payment
    {
        return Payment::query()->create([
            'order_id' => $order->id,
            'provider' => PaymentProviderEnum::PAYU->value,
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
        $paymentMethod = $options['payment_method'] ?? null;
        $customerIp = $options['customer_ip'] ?? '127.0.0.1';
        $continueUrl = $options['continue_url'] ?? config('app.frontend_url').'/checkout/pending?payment='.$payment->id;
        $returnUrl = $options['return_url'] ?? config('app.frontend_url').'/checkout/success';

        $body = [
            'notifyUrl' => config('app.url').'/api/v1/webhooks/payu',
            'customerIp' => $customerIp,
            'merchantPosId' => (string) config('services.payu.pos_id'),
            'description' => 'Zamówienie #'.($order->reference_number ?? $order->id),
            'currencyCode' => strtoupper($payment->currency_code),
            'totalAmount' => (string) $payment->amount,
            'extOrderId' => (string) $payment->id,
            'buyer' => $this->buildBuyer($order),
            'products' => $this->buildProducts($order),
        ];

        [$body, $action] = match ($paymentMethod) {
            'blik' => $this->withBlik($body, $options),
            'apple_pay', 'google_pay' => $this->withToken($body, $options, $paymentMethod),
            default => $this->withRedirect($body, $continueUrl),
        };

        $response = $this->client->createOrder($body);

        $orderId = $response['orderId'] ?? $response['order']['orderId'] ?? null;
        $redirectUri = $response['redirectUri'] ?? null;

        if ($orderId) {
            $payment->update([
                'provider_transaction_id' => $orderId,
                'payment_method' => $paymentMethod,
                'payload' => $response,
            ]);
        }

        if ($action === 'redirect' && $redirectUri) {
            return ['action' => 'redirect', 'redirect_url' => $redirectUri, 'message' => 'Redirect to PayU'];
        }

        if ($action === 'wait') {
            return ['action' => 'wait', 'redirect_url' => null, 'message' => 'Awaiting BLIK confirmation'];
        }

        return ['action' => 'none', 'redirect_url' => null, 'message' => 'Payment processed'];
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

        $data = ['refund' => ['description' => 'Refund']];

        if ($amount > 0) {
            $data['refund']['amount'] = (string) $amount;
        }

        $response = $this->client->createRefund($payment->provider_transaction_id, $data);

        return isset($response['refund']) || ($response['status']['statusCode'] ?? '') === 'SUCCESS';
    }

    public function handleWebhook(array $payload): void
    {
        $payuOrderId = $payload['order']['orderId'] ?? null;
        $payuStatus = $payload['order']['status'] ?? null;
        $extOrderId = $payload['order']['extOrderId'] ?? null;

        if (! $payuOrderId || ! $payuStatus) {
            return;
        }

        /** @var Payment|null $payment */
        $payment = Payment::query()
            ->where('provider_transaction_id', $payuOrderId)
            ->orWhere('id', $extOrderId)
            ->first();

        if (! $payment) {
            return;
        }

        match ($payuStatus) {
            'COMPLETED' => $this->markCompleted($payment),
            'CANCELED' => $payment->update(['status' => PaymentStatusEnum::FAILED->value]),
            default => null, // PENDING, WAITING_FOR_CONFIRMATION — no change
        };
    }

    /**
     * Validate Apple Pay merchant session.
     *
     * @return array<string, mixed>
     */
    public function validateApplePayMerchant(string $validationUrl, string $domain): array
    {
        $certPath = config('services.apple_pay.cert_path');
        $keyPath = config('services.apple_pay.key_path');
        $merchantId = config('services.apple_pay.merchant_id');

        if (! $certPath || ! $keyPath || ! $merchantId) {
            throw new RuntimeException('Apple Pay certificates not configured');
        }

        $payload = json_encode([
            'merchantIdentifier' => $merchantId,
            'domainName' => $domain,
            'displayName' => config('app.name'),
        ]);

        $ch = curl_init($validationUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_SSLCERT => $certPath,
            CURLOPT_SSLKEY => $keyPath,
        ]);

        $result = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new RuntimeException('Apple Pay validation failed: '.$error);
        }

        return json_decode((string) $result, true) ?? [];
    }

    // ── Private helpers ────────────────────────────────────────────────────

    /**
     * @param  array<string, mixed>  $body
     * @return array{0: array<string, mixed>, 1: string}
     */
    private function withBlik(array $body, array $options): array
    {
        $blikCode = $options['blik_code'] ?? '';
        $body['payMethods'] = [
            'payMethod' => [
                'type' => 'BLIK_CODE',
                'value' => $blikCode,
            ],
        ];

        return [$body, 'wait'];
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array{0: array<string, mixed>, 1: string}
     */
    private function withToken(array $body, array $options, string $method): array
    {
        $value = $method === 'google_pay' ? 'ap' : 'jp';
        $body['payMethods'] = [
            'payMethod' => [
                'type' => 'PBL',
                'value' => $value,
                'authorizationCode' => $options['payment_token'] ?? '',
            ],
        ];

        return [$body, 'none'];
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array{0: array<string, mixed>, 1: string}
     */
    private function withRedirect(array $body, string $continueUrl): array
    {
        $body['continueUrl'] = $continueUrl;

        return [$body, 'redirect'];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildBuyer(Order $order): array
    {
        $address = $order->billingAddress ?? $order->shippingAddress;

        return [
            'firstName' => $address?->first_name ?? '',
            'lastName' => $address?->last_name ?? '',
            'email' => $order->customer?->email ?? '',
            'phone' => $address?->phone ?? '',
            'language' => 'pl',
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildProducts(Order $order): array
    {
        if ($order->items->isEmpty()) {
            return [
                [
                    'name' => 'Zamówienie #'.($order->reference_number ?? $order->id),
                    'unitPrice' => (string) $order->total,
                    'quantity' => '1',
                ],
            ];
        }

        return $order->items->map(fn ($item) => [
            'name' => $item->product_name ?? 'Produkt',
            'unitPrice' => (string) $item->unit_price,
            'quantity' => (string) $item->quantity,
        ])->values()->all();
    }

    private function markCompleted(Payment $payment): void
    {
        $payment->update(['status' => PaymentStatusEnum::COMPLETED->value]);

        $order = $payment->order;
        if ($order && $order->status !== OrderStatusEnum::PAID) {
            $order->update(['status' => OrderStatusEnum::PAID->value]);
        }
    }
}
