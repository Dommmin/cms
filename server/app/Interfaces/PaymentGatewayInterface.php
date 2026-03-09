<?php

declare(strict_types=1);

namespace App\Interfaces;

use App\Models\Order;
use App\Models\Payment;

/**
 * Payment Gateway Interface
 * All payment gateways must implement this interface
 */
interface PaymentGatewayInterface
{
    /**
     * Create a payment for an order
     */
    public function createPayment(Order $order, array $data): Payment;

    /**
     * Process payment (redirect to gateway)
     */
    public function processPayment(Payment $payment): array;

    /**
     * Verify payment status
     */
    public function verifyPayment(Payment $payment): bool;

    /**
     * Refund a payment
     */
    public function refundPayment(Payment $payment, int $amount): bool;

    /**
     * Handle webhook from payment gateway
     */
    public function handleWebhook(array $payload): void;
}
