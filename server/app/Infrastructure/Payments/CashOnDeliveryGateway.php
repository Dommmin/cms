<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments;

use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use App\Models\Payment;

class CashOnDeliveryGateway implements PaymentGatewayInterface
{
    public function createPayment(Order $order, array $data): Payment
    {
        return Payment::query()->create([
            'order_id' => $order->id,
            'provider' => PaymentProviderEnum::CASH_ON_DELIVERY->value,
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
            'provider' => PaymentProviderEnum::CASH_ON_DELIVERY->value,
            'action' => 'none',
            'message' => 'Płatność przy odbiorze – zapłać kurierowi lub w sklepie.',
        ];
    }

    public function verifyPayment(Payment $payment): bool
    {
        return $payment->status === PaymentStatusEnum::COMPLETED;
    }

    public function refundPayment(Payment $payment, int $amount): bool
    {
        $payment->update(['status' => PaymentStatusEnum::REFUNDED->value]);

        return true;
    }

    public function handleWebhook(array $payload): void
    {
        // Cash on delivery does not use webhooks
    }
}
