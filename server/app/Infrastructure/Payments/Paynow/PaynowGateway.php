<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\Paynow;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Interfaces\PaymentGatewayInterface;
use App\Models\Address;
use App\Models\Order;
use App\Models\Payment;
use App\States\Order\PaidState;

class PaynowGateway implements PaymentGatewayInterface
{
    public function __construct(
        private readonly PaynowClient $client
    ) {}

    public function createPayment(Order $order, array $data = []): Payment
    {
        return Payment::query()->create([
            'order_id' => $order->id,
            'provider' => PaymentProviderEnum::PAYNOW->value,
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
        $body = [
            'amount' => $payment->amount,
            'currency' => mb_strtoupper($payment->currency_code),
            'externalId' => (string) $payment->id,
            'description' => 'Zamówienie #'.($order->reference_number ?? $order->id),
            'continueUrl' => $options['continue_url'] ?? config('app.frontend_url').'/checkout/pending?payment='.$payment->id,
            'buyer' => $this->buildBuyer($order),
            'orderItems' => $this->buildOrderItems($order),
        ];

        $paymentMethodId = $options['payment_method_id'] ?? null;
        if ($paymentMethodId !== null) {
            $body['paymentMethodId'] = (int) $paymentMethodId;
        }

        $response = $this->client->createPayment($body, $this->idempotencyKey($payment, 'create'));

        $paymentId = $response['paymentId'] ?? null;
        $redirectUrl = $response['redirectUrl'] ?? null;

        if ($paymentId) {
            $payment->update([
                'provider_transaction_id' => $paymentId,
                'payment_method' => $options['payment_method'] ?? 'paynow',
                'payload' => $response,
            ]);
        }

        return [
            'action' => 'redirect',
            'redirect_url' => is_string($redirectUrl) ? $redirectUrl : null,
            'message' => 'Redirect to Paynow',
        ];
    }

    public function verifyPayment(Payment $payment): bool
    {
        if (! $payment->provider_transaction_id) {
            return $payment->status === PaymentStatusEnum::COMPLETED;
        }

        $response = $this->client->getPaymentStatus(
            $payment->provider_transaction_id,
            $this->idempotencyKey($payment, 'status'),
        );

        $this->applyStatus($payment, (string) ($response['status'] ?? ''));

        return $payment->fresh()->status === PaymentStatusEnum::COMPLETED;
    }

    public function refundPayment(Payment $payment, int $amount): bool
    {
        return false;
    }

    public function handleWebhook(array $payload): void
    {
        $paymentId = $payload['paymentId'] ?? null;
        $externalId = $payload['externalId'] ?? null;
        $status = (string) ($payload['status'] ?? '');

        if (! $paymentId && ! $externalId) {
            return;
        }

        /** @var Payment|null $payment */
        $payment = Payment::query()
            ->where('provider_transaction_id', $paymentId)
            ->when($externalId, fn ($query) => $query->orWhere('id', $externalId))
            ->first();

        if (! $payment) {
            return;
        }

        if ($paymentId && ! $payment->provider_transaction_id) {
            $payment->update(['provider_transaction_id' => $paymentId]);
        }

        $this->applyStatus($payment, $status);
    }

    private function applyStatus(Payment $payment, string $status): void
    {
        match (mb_strtoupper($status)) {
            'CONFIRMED' => $this->markCompleted($payment),
            'REJECTED', 'EXPIRED', 'ERROR', 'ABANDONED' => $this->markFailed($payment),
            default => null,
        };
    }

    private function markCompleted(Payment $payment): void
    {
        if ($payment->status !== PaymentStatusEnum::COMPLETED) {
            $payment->update(['status' => PaymentStatusEnum::COMPLETED->value]);
        }

        $order = $payment->order;
        if (! $order->status->equals(PaidState::class)) {
            $order->update(['status' => OrderStatusEnum::PAID->value]);
        }
    }

    private function markFailed(Payment $payment): void
    {
        if ($payment->status === PaymentStatusEnum::COMPLETED) {
            return;
        }

        $payment->update(['status' => PaymentStatusEnum::FAILED->value]);
    }

    private function buildBuyer(Order $order): array
    {
        $billing = $order->billingAddress;
        $shipping = $order->shippingAddress;
        $address = $billing;
        $customer = $order->customer;
        $email = $customer ? $customer->email : ($order->guest_email ?? '');

        return array_filter([
            'email' => mb_substr($email, 0, 50),
            'firstName' => mb_substr($address->first_name, 0, 50),
            'lastName' => mb_substr($address->last_name, 0, 50),
            'phone' => $this->phone($address->phone),
            'address' => [
                'billing' => $this->address($billing),
                'shipping' => $this->address($shipping),
            ],
            'locale' => 'pl-PL',
        ], fn (string|array|null $value): bool => $value !== null && $value !== []);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function phone(?string $phone): ?array
    {
        if (! $phone) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        if ($digits === '') {
            return null;
        }

        if (str_starts_with($digits, '48') && mb_strlen($digits) > 9) {
            $digits = mb_substr($digits, 2);
        }

        return [
            'prefix' => '+48',
            'number' => (int) mb_substr($digits, 0, 10),
        ];
    }

    /**
     * @return array<string, string>|null
     */
    private function address(?Address $address): ?array
    {
        if (! $address instanceof Address) {
            return null;
        }

        return array_filter([
            'street' => mb_substr($address->street, 0, 100),
            'zipcode' => mb_substr($address->postal_code, 0, 10),
            'city' => mb_substr($address->city, 0, 100),
            'country' => mb_strtoupper($address->country_code ?: 'PL'),
        ], filled(...));
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function buildOrderItems(Order $order): array
    {
        if ($order->items->isEmpty()) {
            return [
                [
                    'name' => 'Zamówienie #'.($order->reference_number ?? $order->id),
                    'category' => 'Order',
                    'quantity' => 1,
                    'price' => $order->total,
                ],
            ];
        }

        return $order->items->map(fn ($item): array => [
            'name' => mb_substr($item->product_name ?? 'Produkt', 0, 120),
            'category' => 'Product',
            'quantity' => (int) $item->quantity,
            'price' => (int) $item->unit_price,
        ])->values()->all();
    }

    private function idempotencyKey(Payment $payment, string $operation): string
    {
        return mb_substr(sprintf('paynow-%s-%s', $operation, $payment->id), 0, 45);
    }
}
