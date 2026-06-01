<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentStatusEnum;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ValidateApplePayMerchantRequest;
use App\Infrastructure\Payments\PayU\PayUGateway;
use App\Models\Payment;
use App\Services\PaymentGatewayManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Throwable;

class PaymentController extends ApiController
{
    /**
     * GET /api/v1/payments/{payment}/status
     */
    public function status(Payment $payment, PaymentGatewayManager $gatewayManager): JsonResponse
    {
        Gate::authorize('view', $payment);

        if ($payment->status === PaymentStatusEnum::PENDING) {
            try {
                $gatewayManager->driver($payment->provider)->verifyPayment($payment);
            } catch (Throwable $e) {
                Log::error('Payment status verification failed: '.$e->getMessage(), [
                    'payment_id' => $payment->id,
                    'provider' => $payment->provider->value,
                    'exception' => $e,
                ]);
            }
        }

        return $this->ok([
            'status' => $payment->fresh()->status->value,
            'order_reference' => $payment->order->reference_number,
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
