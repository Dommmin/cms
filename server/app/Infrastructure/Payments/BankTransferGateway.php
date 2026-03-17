<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments;

use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use App\Models\Payment;

class BankTransferGateway implements PaymentGatewayInterface
{
    public function createPayment(Order $order, array $data): Payment
    {
        return Payment::query()->create([
            'order_id' => $order->id,
            'provider' => PaymentProviderEnum::BANK_TRANSFER->value,
            'provider_transaction_id' => null,
            'status' => PaymentStatusEnum::PENDING->value,
            'amount' => $order->total,
            'currency_code' => $order->currency_code,
            'payload' => $data,
        ]);
    }

    public function processPayment(Payment $payment, array $options = []): array
    {
        return [
            'action' => 'none',
            'bank_details' => [
                'account_name' => config('services.bank_transfer.account_name', ''),
                'iban' => config('services.bank_transfer.iban', ''),
                'swift' => config('services.bank_transfer.swift', ''),
                'bank_name' => config('services.bank_transfer.bank_name', ''),
                'reference' => $payment->order->reference_number ?? '',
                'amount' => $payment->amount,
                'currency' => $payment->currency_code,
            ],
            'message' => 'Proszę dokonać przelewu na podany rachunek bankowy.',
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
        // Bank transfer uses manual payment confirmation — no webhook support.
    }
}
