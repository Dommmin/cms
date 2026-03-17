<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Infrastructure\Payments\PayU\PayUGateway;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PaymentController extends Controller
{
    /**
     * GET /api/v1/payments/{payment}/status
     */
    public function status(Payment $payment): JsonResponse
    {
        Gate::authorize('view', $payment);

        return response()->json([
            'status' => $payment->status->value,
            'order_reference' => $payment->order?->reference_number,
        ]);
    }

    /**
     * POST /api/v1/payments/apple-pay/validate-merchant
     */
    public function validateApplePayMerchant(Request $request, PayUGateway $gateway): JsonResponse
    {
        $validated = $request->validate([
            'validation_url' => ['required', 'url'],
            'domain' => ['required', 'string', 'max:255'],
        ]);

        $session = $gateway->validateApplePayMerchant($validated['validation_url'], $validated['domain']);

        return response()->json($session);
    }
}
