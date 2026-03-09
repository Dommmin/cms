<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments;

use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use App\Models\Payment;

class PayUGateway implements PaymentGatewayInterface
{
    public function createPayment(Order $order, array $data): Payment
    {
        return Payment::query()->create([
            'order_id' => $order->id,
            'provider' => PaymentProviderEnum::PAYU->value,
            'provider_transaction_id' => null,
            'status' => PaymentStatusEnum::PENDING->value,
            'amount' => $order->total,
            'currency_code' => $order->currency_code,
            'payload' => $data,
        ]);
    }

    public function processPayment(Payment $payment): array
    {
        return [
            'provider' => $payment->provider->value,
            'action' => 'redirect',
            'redirect_url' => null,
            'message' => 'PayU integration not implemented yet',
        ];
    }

    public function verifyPayment(Payment $payment): bool
    {
        return $payment->status === PaymentStatusEnum::COMPLETED;
    }

    public function refundPayment(Payment $payment, int $amount): bool
    {
        return false;
    }

    public function handleWebhook(array $payload): void
    {
        // Stub: to be implemented
    }
}
