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
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CheckoutService $checkoutService
    ) {}

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
        $user = $request->user();

        $order = $this->checkoutService->checkout(
            user: $user,
            shippingMethodId: $data['shipping_method_id'],
            paymentProvider: PaymentProviderEnum::from($data['payment_provider']),
            billingAddress: $data['billing_address'],
            shippingAddress: $data['shipping_address'],
            pickupPointId: $data['pickup_point_id'] ?? null,
            notes: $data['notes'] ?? null,
            referralCode: $data['referral_code'] ?? null,
        );

        // Order confirmation email is sent via OrderCreated event listener

        return response()->json(['data' => new OrderResource($order)], 201);
    }
}
