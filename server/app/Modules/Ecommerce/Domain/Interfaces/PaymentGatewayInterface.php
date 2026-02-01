<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Interfaces;

use App\Modules\Ecommerce\Domain\Models\Order;
use App\Modules\Ecommerce\Domain\Models\Payment;

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

