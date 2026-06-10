<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\Stripe;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Cashier;
use Laravel\Cashier\Checkout;
use Stripe\Checkout\Session;
use Throwable;

class StripeCheckoutSessionService
{
    /**
     * @param  array<string, mixed>  $options
     * @return array{session_id: string, url: string|null, payload: array<string, mixed>}
     */
    public function createSession(Order $order, Payment $payment, ?User $user = null, array $options = []): array
    {
        $order->loadMissing(['customer.user']);

        $sessionOptions = $this->sessionOptions($order, $payment, $options, ! $user instanceof User);
        $lineItems = $this->lineItems($order, $payment);

        $checkout = $user instanceof User
            ? Checkout::customer($user)->create($lineItems, $sessionOptions)
            : Checkout::guest()->create($lineItems, $sessionOptions);

        $session = $checkout->asStripeCheckoutSession();

        return [
            'session_id' => (string) $session->id,
            'url' => $session->url,
            'payload' => $session->toArray(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function retrieveSession(string $sessionId): array
    {
        /** @var Session $session */
        $session = Cashier::stripe()->checkout->sessions->retrieve($sessionId);

        return $session->toArray();
    }

    public function refundPayment(string $paymentIntent, int $amount): bool
    {
        try {
            $response = Cashier::stripe()->refunds->create([
                'payment_intent' => $paymentIntent,
                'amount' => $amount,
            ]);

            return isset($response->id);
        } catch (Throwable $throwable) {
            Log::error('Stripe refundPayment failed: '.$throwable->getMessage(), [
                'payment_intent' => $paymentIntent,
                'amount' => $amount,
            ]);

            return false;
        }
    }

    private function lineItems(Order $order, Payment $payment): array
    {
        return [[
            'price_data' => [
                'currency' => mb_strtolower($payment->currency_code),
                'product_data' => [
                    'name' => sprintf('Order #%s', $order->reference_number ?? $order->id),
                ],
                'unit_amount' => $payment->amount,
            ],
            'quantity' => 1,
        ]];
    }

    /**
     * @param  array<string, mixed>  $options
     * @return array<string, mixed>
     */
    private function sessionOptions(Order $order, Payment $payment, array $options, bool $guestCheckout): array
    {
        $successUrl = $options['success_url'] ?? $options['return_url'] ?? config('app.frontend_url').'/checkout/pending?payment='.$payment->id.'&ref='.$order->reference_number.'&session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl = $options['cancel_url'] ?? $options['continue_url'] ?? config('app.frontend_url').'/checkout/pending?payment='.$payment->id.'&ref='.$order->reference_number;

        $metadata = array_merge([
            'order_id' => (string) $order->id,
            'payment_id' => (string) $payment->id,
            'reference_number' => (string) $order->reference_number,
            'provider' => 'stripe',
        ], is_array($options['metadata'] ?? null) ? $options['metadata'] : []);

        $sessionOptions = [
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'metadata' => $metadata,
        ];

        if ($guestCheckout) {
            $customerEmail = $options['customer_email'] ?? $order->guest_email ?? $order->customer?->email;

            if (is_string($customerEmail) && $customerEmail !== '') {
                $sessionOptions['customer_email'] = $customerEmail;
            }
        }

        return $sessionOptions;
    }
}
