<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\Stripe;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\States\Order\PaidState;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class StripeGateway implements PaymentGatewayInterface
{
    public function __construct(
        private StripeCheckoutSessionService $checkoutSessionService
    ) {}

    public function createPayment(Order $order, array $data = []): Payment
    {
        return Payment::query()->create([
            'order_id' => $order->id,
            'provider' => PaymentProviderEnum::STRIPE->value,
            'payment_method' => null,
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
        $order->loadMissing(['customer.user']);

        try {
            $session = $this->checkoutSessionService->createSession(
                $order,
                $payment,
                $this->billableUser($order),
                $options,
            );

            $payment->update([
                'provider_transaction_id' => $session['session_id'],
                'payload' => $session['payload'],
            ]);

            return [
                'action' => 'redirect',
                'redirect_url' => $session['url'],
                'message' => 'Redirect to Stripe Checkout',
            ];
        } catch (Throwable $throwable) {
            Log::error('Stripe processPayment failed: '.$throwable->getMessage(), [
                'payment_id' => $payment->id,
                'order_id' => $order->id,
            ]);

            return [
                'action' => 'redirect',
                'redirect_url' => null,
                'message' => 'Stripe checkout creation failed',
            ];
        }
    }

    public function verifyPayment(Payment $payment): bool
    {
        if (! $payment->provider_transaction_id) {
            return $payment->status === PaymentStatusEnum::COMPLETED;
        }

        try {
            $session = $this->checkoutSessionService->retrieveSession($payment->provider_transaction_id);
            $this->syncFromSession($payment, $session);
        } catch (Throwable $throwable) {
            Log::error('Stripe verifyPayment failed: '.$throwable->getMessage(), [
                'payment_id' => $payment->id,
                'provider_transaction_id' => $payment->provider_transaction_id,
            ]);
        }

        return $payment->fresh()->status === PaymentStatusEnum::COMPLETED;
    }

    public function refundPayment(Payment $payment, int $amount): bool
    {
        $paymentIntent = $this->paymentIntentId($payment);

        if (! is_string($paymentIntent) || $paymentIntent === '') {
            return false;
        }

        return $this->checkoutSessionService->refundPayment($paymentIntent, $amount);
    }

    public function handleWebhook(array $payload): void
    {
        $type = (string) ($payload['type'] ?? '');
        $session = $payload['data']['object'] ?? null;

        if (! is_array($session)) {
            return;
        }

        $payment = $this->paymentFromSession($session);

        if (! $payment instanceof Payment) {
            return;
        }

        if ($type === 'checkout.session.completed') {
            $this->syncFromSession($payment, $session);

            return;
        }

        if ($type === 'checkout.session.expired') {
            $this->markFailed($payment);
        }
    }

    private function billableUser(Order $order): ?User
    {
        $user = $order->customer?->user;

        return $user instanceof User ? $user : null;
    }

    /**
     * @param  array<string, mixed>  $session
     */
    private function paymentFromSession(array $session): ?Payment
    {
        $sessionId = $session['id'] ?? null;
        $paymentId = $session['metadata']['payment_id'] ?? null;

        /** @var Payment|null $payment */
        $payment = Payment::query()
            ->where(function ($query) use ($sessionId, $paymentId): void {
                if (is_string($sessionId)) {
                    $query->where('provider_transaction_id', $sessionId);
                }

                if (is_numeric($paymentId)) {
                    $query->orWhere('id', (int) $paymentId);
                }
            })
            ->first();

        return $payment;
    }

    /**
     * @param  array<string, mixed>  $session
     */
    private function syncFromSession(Payment $payment, array $session): void
    {
        if (($session['payment_status'] ?? null) !== 'paid') {
            if (($session['status'] ?? null) === 'expired') {
                $this->markFailed($payment);
            }

            return;
        }

        if ($payment->status !== PaymentStatusEnum::COMPLETED) {
            $payment->update(['status' => PaymentStatusEnum::COMPLETED->value]);
        }

        $payment->update([
            'provider_transaction_id' => (string) ($session['id'] ?? $payment->provider_transaction_id),
            'payload' => $session,
        ]);

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

    private function paymentIntentId(Payment $payment): ?string
    {
        $paymentIntent = $payment->payload['payment_intent'] ?? null;

        if (is_string($paymentIntent) && $paymentIntent !== '') {
            return $paymentIntent;
        }

        if (! $payment->provider_transaction_id) {
            return null;
        }

        try {
            $session = $this->checkoutSessionService->retrieveSession($payment->provider_transaction_id);

            $paymentIntent = $session['payment_intent'] ?? null;

            if (is_string($paymentIntent) && $paymentIntent !== '') {
                return $paymentIntent;
            }
        } catch (Throwable $throwable) {
            Log::error('Stripe paymentIntentId lookup failed: '.$throwable->getMessage(), [
                'payment_id' => $payment->id,
                'provider_transaction_id' => $payment->provider_transaction_id,
            ]);
        }

        return null;
    }
}
