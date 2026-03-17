<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentProviderEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CheckoutRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Http\Resources\Api\V1\ShippingMethodResource;
use App\Models\ShippingMethod;
use App\Services\CheckoutService;
use App\Services\PaymentGatewayManager;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CheckoutService $checkoutService,
        private readonly PaymentGatewayManager $gatewayManager
    ) {}

    /**
     * Return available payment providers and whether their credentials are configured
     * in server/.env. Unconfigured providers are returned so the frontend can display
     * a clear "set these variables to enable this payment method" message.
     */
    public function paymentMethods(): JsonResponse
    {
        $methods = [
            [
                'id' => 'cash_on_delivery',
                'configured' => true,
                'missing_env' => [],
            ],
            [
                'id' => 'payu',
                'configured' => ! empty(config('services.payu.client_id'))
                    && ! empty(config('services.payu.client_secret'))
                    && ! empty(config('services.payu.pos_id'))
                    && ! empty(config('services.payu.md5_key')),
                'missing_env' => array_values(array_filter([
                    empty(config('services.payu.client_id')) ? 'PAYU_CLIENT_ID' : null,
                    empty(config('services.payu.client_secret')) ? 'PAYU_CLIENT_SECRET' : null,
                    empty(config('services.payu.pos_id')) ? 'PAYU_POS_ID' : null,
                    empty(config('services.payu.md5_key')) ? 'PAYU_MD5_KEY' : null,
                ])),
            ],
            [
                'id' => 'p24',
                'configured' => ! empty(config('services.p24.merchant_id'))
                    && ! empty(config('services.p24.pos_id'))
                    && ! empty(config('services.p24.crc'))
                    && ! empty(config('services.p24.api_key')),
                'missing_env' => array_values(array_filter([
                    empty(config('services.p24.merchant_id')) ? 'P24_MERCHANT_ID' : null,
                    empty(config('services.p24.pos_id')) ? 'P24_POS_ID' : null,
                    empty(config('services.p24.crc')) ? 'P24_CRC' : null,
                    empty(config('services.p24.api_key')) ? 'P24_API_KEY' : null,
                ])),
            ],
            [
                'id' => 'apple_pay',
                'configured' => ! empty(config('services.apple_pay.merchant_id'))
                    && ! empty(config('services.apple_pay.cert_path'))
                    && ! empty(config('services.apple_pay.key_path')),
                'missing_env' => array_values(array_filter([
                    empty(config('services.apple_pay.merchant_id')) ? 'APPLE_PAY_MERCHANT_ID' : null,
                    empty(config('services.apple_pay.cert_path')) ? 'APPLE_PAY_CERT_PATH' : null,
                    empty(config('services.apple_pay.key_path')) ? 'APPLE_PAY_KEY_PATH' : null,
                ])),
            ],
            [
                'id' => 'google_pay',
                // Google Pay flows through PayU
                'configured' => ! empty(config('services.payu.client_id'))
                    && ! empty(config('services.payu.client_secret')),
                'missing_env' => array_values(array_filter([
                    empty(config('services.payu.client_id')) ? 'PAYU_CLIENT_ID' : null,
                    empty(config('services.payu.client_secret')) ? 'PAYU_CLIENT_SECRET' : null,
                ])),
            ],
            [
                'id' => 'bank_transfer',
                'configured' => ! empty(config('services.bank_transfer.account_name'))
                    && ! empty(config('services.bank_transfer.iban')),
                'missing_env' => array_values(array_filter([
                    empty(config('services.bank_transfer.account_name')) ? 'BANK_TRANSFER_ACCOUNT_NAME' : null,
                    empty(config('services.bank_transfer.iban')) ? 'BANK_TRANSFER_IBAN' : null,
                ])),
            ],
        ];

        return response()->json(['data' => $methods]);
    }

    public function shippingMethods(): JsonResponse
    {
        $methods = ShippingMethod::query()
            ->where('is_active', true)
            ->orderBy('base_price')
            ->get();

        return response()->json([
            'data' => ShippingMethodResource::collection($methods),
        ]);
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = auth('sanctum')->user();
        $cartToken = $request->header('X-Cart-Token');

        $order = $this->checkoutService->checkout(
            user: $user,
            shippingMethodId: $data['shipping_method_id'],
            paymentProvider: PaymentProviderEnum::from($data['payment_provider']),
            billingAddress: $data['billing_address'],
            shippingAddress: $data['shipping_address'],
            guestEmail: $data['guest_email'] ?? null,
            cartToken: is_string($cartToken) ? $cartToken : null,
            pickupPointId: $data['pickup_point_id'] ?? null,
            notes: $data['notes'] ?? null,
            referralCode: $data['referral_code'] ?? null,
        );

        // Order confirmation email is sent via OrderCreated event listener

        $payment = $order->payment;
        $result = ['action' => 'none', 'redirect_url' => null, 'message' => 'Order created'];

        if ($payment) {
            $gateway = $this->gatewayManager->driver($payment->provider);
            $result = $gateway->processPayment($payment, [
                'customer_ip' => $request->ip(),
                'payment_method' => $data['payment_method'] ?? null,
                'blik_code' => $data['blik_code'] ?? null,
                'payment_token' => $data['payment_token'] ?? null,
                'return_url' => config('app.frontend_url').'/checkout/success?ref='.$order->reference_number,
                'continue_url' => config('app.frontend_url').'/checkout/pending?payment='.$payment->id,
            ]);
        }

        return response()->json([
            'order' => new OrderResource($order),
            'payment' => [
                'id' => $payment?->id,
                'action' => $result['action'],
                'redirect_url' => $result['redirect_url'] ?? null,
                'bank_details' => $result['bank_details'] ?? null,
            ],
        ], 201);
    }
}
