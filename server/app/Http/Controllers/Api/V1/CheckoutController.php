<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentProviderEnum;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\CheckoutRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Http\Resources\Api\V1\ShippingMethodResource;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Services\InventoryService;
use App\Services\PaymentGatewayManager;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CheckoutController extends ApiController
{
    public function __construct(
        private readonly CheckoutService $checkoutService,
        private readonly PaymentGatewayManager $gatewayManager,
        private readonly CartService $cartService,
    ) {}

    /**
     * Return available payment providers and whether their admin settings are configured.
     * Unconfigured providers are returned so the frontend can display a clear
     * "configure these settings in the admin panel" message.
     */
    public function paymentMethods(): JsonResponse
    {
        $methods = [
            [
                'id' => 'cash_on_delivery',
                'configured' => true,
                'missing_settings' => [],
            ],
            [
                'id' => 'payu',
                'configured' => ! empty(config('services.payu.client_id'))
                    && ! empty(config('services.payu.client_secret'))
                    && ! empty(config('services.payu.pos_id'))
                    && ! empty(config('services.payu.md5_key')),
                'missing_settings' => array_values(array_filter([
                    empty(config('services.payu.client_id')) ? 'payments.payu_client_id' : null,
                    empty(config('services.payu.client_secret')) ? 'payments.payu_client_secret' : null,
                    empty(config('services.payu.pos_id')) ? 'payments.payu_pos_id' : null,
                    empty(config('services.payu.md5_key')) ? 'payments.payu_md5_key' : null,
                ])),
            ],
            [
                'id' => 'p24',
                'configured' => ! empty(config('services.p24.merchant_id'))
                    && ! empty(config('services.p24.pos_id'))
                    && ! empty(config('services.p24.crc'))
                    && ! empty(config('services.p24.api_key')),
                'missing_settings' => array_values(array_filter([
                    empty(config('services.p24.merchant_id')) ? 'payments.p24_merchant_id' : null,
                    empty(config('services.p24.pos_id')) ? 'payments.p24_pos_id' : null,
                    empty(config('services.p24.crc')) ? 'payments.p24_crc' : null,
                    empty(config('services.p24.api_key')) ? 'payments.p24_api_key' : null,
                ])),
            ],
            [
                'id' => 'paynow',
                'configured' => ! empty(config('services.paynow.api_key'))
                    && ! empty(config('services.paynow.signature_key')),
                'missing_settings' => array_values(array_filter([
                    empty(config('services.paynow.api_key')) ? 'payments.paynow_api_key' : null,
                    empty(config('services.paynow.signature_key')) ? 'payments.paynow_signature_key' : null,
                ])),
            ],
            [
                'id' => 'stripe',
                'configured' => ! empty(config('services.stripe.key'))
                    && ! empty(config('services.stripe.secret'))
                    && ! empty(config('services.stripe.webhook_secret')),
                'missing_settings' => array_values(array_filter([
                    empty(config('services.stripe.key')) ? 'payments.stripe_public_key' : null,
                    empty(config('services.stripe.secret')) ? 'payments.stripe_secret_key' : null,
                    empty(config('services.stripe.webhook_secret')) ? 'payments.stripe_webhook_secret' : null,
                ])),
            ],
            [
                'id' => 'paypo',
                'configured' => ! empty(config('services.paynow.api_key'))
                    && ! empty(config('services.paynow.signature_key')),
                'missing_settings' => array_values(array_filter([
                    empty(config('services.paynow.api_key')) ? 'payments.paynow_api_key' : null,
                    empty(config('services.paynow.signature_key')) ? 'payments.paynow_signature_key' : null,
                ])),
            ],
            [
                'id' => 'apple_pay',
                'configured' => ! empty(config('services.apple_pay.merchant_id'))
                    && ! empty(config('services.apple_pay.cert_path'))
                    && ! empty(config('services.apple_pay.key_path')),
                'missing_settings' => array_values(array_filter([
                    empty(config('services.apple_pay.merchant_id')) ? 'apple_pay.merchant_id' : null,
                    empty(config('services.apple_pay.cert_path')) ? 'apple_pay.cert_path' : null,
                    empty(config('services.apple_pay.key_path')) ? 'apple_pay.key_path' : null,
                ])),
            ],
            [
                'id' => 'google_pay',
                // Google Pay flows through PayU
                'configured' => ! empty(config('services.payu.client_id'))
                    && ! empty(config('services.payu.client_secret')),
                'missing_settings' => array_values(array_filter([
                    empty(config('services.payu.client_id')) ? 'payments.payu_client_id' : null,
                    empty(config('services.payu.client_secret')) ? 'payments.payu_client_secret' : null,
                ])),
            ],
            [
                'id' => 'bank_transfer',
                'configured' => ! empty(config('services.bank_transfer.account_name'))
                    && ! empty(config('services.bank_transfer.iban')),
                'missing_settings' => array_values(array_filter([
                    empty(config('services.bank_transfer.account_name')) ? 'payments.bank_transfer_account_name' : null,
                    empty(config('services.bank_transfer.iban')) ? 'payments.bank_transfer_iban' : null,
                ])),
            ],
        ];

        return $this->ok($methods);
    }

    public function shippingMethods(Request $request): AnonymousResourceCollection
    {
        /** @var User|null $user */
        $user = auth('sanctum')->user();
        $cartToken = $request->header('X-Cart-Token');

        $cart = $this->cartService->getOrCreateCart($user, is_string($cartToken) ? $cartToken : null);
        $cart->load('items.variant');

        $productIds = $cart->items->pluck('variant.product_id')->filter()->unique()->values()->all();
        $categoryIds = Product::query()->whereIn('id', $productIds)->pluck('category_id')->filter()->unique()->values()->all();

        $methods = ShippingMethod::query()
            ->where('is_active', true)
            ->with(['restrictedProducts', 'restrictedCategories'])
            ->orderBy('base_price')
            ->get()
            ->reject(fn (ShippingMethod $method): bool => $method->isRestrictedFor($productIds, $categoryIds))
            ->values();

        return ShippingMethodResource::collection($methods);
    }

    public function reserve(Request $request, InventoryService $inventoryService): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('sanctum')->user();
        $cartToken = $request->header('X-Cart-Token');

        $cart = $this->cartService->getOrCreateCart($user, is_string($cartToken) ? $cartToken : null);

        try {
            $inventoryService->reserveCart($cart, 15);

            return $this->ok(['message' => 'Cart reserved for 15 minutes', 'expires_at' => now()->addMinutes(15)]);
        } catch (Exception $exception) {
            abort(400, $exception->getMessage());
        }
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $data = $request->validated();
        /** @var User|null $user */
        $user = auth('sanctum')->user();
        $cartToken = $request->header('X-Cart-Token');

        $order = $this->checkoutService->checkout(
            user: $user,
            shippingMethodId: $data['shipping_method_id'] ?? null,
            paymentProvider: PaymentProviderEnum::from($data['payment_provider']),
            billingAddress: $data['billing_address'],
            shippingAddress: $data['shipping_address'] ?? null,
            guestEmail: $data['guest_email'] ?? null,
            cartToken: is_string($cartToken) ? $cartToken : null,
            pickupPointId: $data['pickup_point_id'] ?? null,
            notes: $data['notes'] ?? null,
            referralCode: $data['referral_code'] ?? null,
            gaClientId: $data['ga_client_id'] ?? null,
            customerType: $data['customer_type'] ?? 'individual',
            wantsInvoice: (bool) ($data['wants_invoice'] ?? false),
        );

        // Order confirmation email is sent via OrderCreated event listener

        $payment = $order->payment;
        $result = ['action' => 'none', 'redirect_url' => null, 'message' => 'Order created', 'bank_details' => null];

        if ($payment) {
            $gateway = $this->gatewayManager->driver($payment->provider);
            $result = $gateway->processPayment($payment, [
                'customer_ip' => $request->ip(),
                'payment_method' => $data['payment_method'] ?? null,
                'blik_code' => $data['blik_code'] ?? null,
                'payment_token' => $data['payment_token'] ?? null,
                'return_url' => config('app.frontend_url').'/checkout/pending?payment='.$payment->id.'&ref='.$order->reference_number,
                'continue_url' => config('app.frontend_url').'/checkout/pending?payment='.$payment->id.'&ref='.$order->reference_number,
            ]);
        }

        return $this->created([
            'order' => new OrderResource($order),
            'payment' => [
                'id' => $payment?->id,
                'action' => $result['action'],
                'redirect_url' => $result['redirect_url'] ?? null,
                'bank_details' => $result['bank_details'] ?? null,
            ],
        ]);
    }
}
