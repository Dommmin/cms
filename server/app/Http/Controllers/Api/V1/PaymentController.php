<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ValidateApplePayMerchantRequest;
use App\Infrastructure\Payments\PayU\PayUGateway;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class PaymentController extends ApiController
{
    /**
     * GET /api/v1/payments/{payment}/status
     */
    public function status(Payment $payment): JsonResponse
    {
        Gate::authorize('view', $payment);

        return $this->ok([
            'status' => $payment->status->value,
            'order_reference' => $payment->order?->reference_number,
        ]);
    }

    /**
     * POST /api/v1/payments/apple-pay/validate-merchant
     */
    public function validateApplePayMerchant(ValidateApplePayMerchantRequest $request, PayUGateway $gateway): JsonResponse
    {
        $data = $request->validated();

        $session = $gateway->validateApplePayMerchant($data['validation_url'], $data['domain']);

        return $this->ok($session);
    }
}
