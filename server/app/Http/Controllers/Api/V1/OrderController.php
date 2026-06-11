<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusEnum;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\StoreReturnRequestRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Services\CartService;
use App\Services\InvoiceService;
use App\Services\PaymentGatewayManager;
use App\Services\ReturnRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends ApiController
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return OrderResource::collection(Order::query()->whereNull('id')->paginate(10));
        }

        $orders = Order::query()
            ->where('customer_id', $customer->id)
            ->with(['items'])->latest()
            ->paginate(10)
            ->withQueryString();

        return OrderResource::collection($orders);
    }

    public function show(Request $request, string $reference): JsonResponse
    {
        $customer = $request->user()->customer;

        $order = Order::query()
            ->where('reference_number', $reference)
            ->where('customer_id', $customer?->id)
            ->with(['items', 'billingAddress', 'shippingAddress', 'payment', 'shipment', 'statusHistory', 'returns.items.orderItem'])
            ->firstOrFail();

        return $this->ok(new OrderResource($order));
    }

    public function cancel(Request $request, string $reference): JsonResponse
    {
        $customer = $request->user()->customer;

        $order = Order::query()
            ->where('reference_number', $reference)
            ->where('customer_id', $customer?->id)
            ->firstOrFail();

        $currentStatus = OrderStatusEnum::from((string) $order->status);
        if (! in_array($currentStatus, [OrderStatusEnum::PENDING, OrderStatusEnum::AWAITING])) {
            throw ValidationException::withMessages([
                'status' => ['Order cannot be cancelled in its current status'],
            ]);
        }

        $order->changeStatus(OrderStatusEnum::CANCELLED, 'customer', 'Cancelled by customer');

        return $this->ok(new OrderResource($order->fresh()));
    }

    public function pay(Request $request, string $reference, PaymentGatewayManager $gatewayManager): JsonResponse
    {
        $customer = $request->user()->customer;

        $order = Order::query()
            ->where('reference_number', $reference)
            ->where('customer_id', $customer?->id)
            ->with('payment')
            ->firstOrFail();

        $currentStatus = OrderStatusEnum::from((string) $order->status);
        if ($currentStatus !== OrderStatusEnum::AWAITING) {
            throw ValidationException::withMessages([
                'status' => ['Order is not awaiting payment'],
            ]);
        }

        $payment = $order->payment;
        abort_unless($payment instanceof Payment, 404, 'Payment record not found');

        // Reset payment status, transaction ID, and payload to pending/null to allow a clean retry attempt
        $payment->update([
            'status' => PaymentStatusEnum::PENDING->value,
            'provider_transaction_id' => null,
            'payload' => null,
        ]);

        $gateway = $gatewayManager->driver($payment->provider);
        $result = $gateway->processPayment($payment, [
            'customer_ip' => $request->ip(),
            'return_url' => config('app.frontend_url').'/checkout/pending?payment='.$payment->id.'&ref='.$order->reference_number,
            'continue_url' => config('app.frontend_url').'/checkout/pending?payment='.$payment->id.'&ref='.$order->reference_number,
        ]);

        return $this->ok([
            'action' => $result['action'],
            'redirect_url' => $result['redirect_url'] ?? null,
        ]);
    }

    public function invoice(Request $request, string $reference, InvoiceService $invoiceService): Response
    {
        $customer = $request->user()->customer;

        $order = Order::query()
            ->where('reference_number', $reference)
            ->where('customer_id', $customer?->id)
            ->firstOrFail();

        return $invoiceService->download($order);
    }

    public function proforma(Request $request, string $reference, InvoiceService $invoiceService): Response
    {
        $customer = $request->user()->customer;

        $order = Order::query()
            ->where('reference_number', $reference)
            ->where('customer_id', $customer?->id)
            ->firstOrFail();

        return $invoiceService->downloadProforma($order);
    }

    public function reorder(Request $request, string $reference, CartService $cartService): JsonResponse
    {
        $customer = $request->user()->customer;

        $order = Order::query()
            ->where('reference_number', $reference)
            ->where('customer_id', $customer?->id)
            ->with('items.variant')
            ->firstOrFail();

        $cart = $cartService->getOrCreateCart($request->user(), $request->header('X-Cart-Token'));

        $addedCount = 0;
        $skippedCount = 0;

        foreach ($order->items as $item) {
            if (! $item->variant || ! $item->variant->is_active || (! $item->variant->backorder_allowed && $item->variant->stock_quantity < 1)) {
                $skippedCount++;

                continue;
            }

            $existingCartItem = $cart->items()->where('variant_id', $item->variant_id)->first();

            if ($existingCartItem instanceof CartItem) {
                $existingCartItem->getQuery()->where('id', $existingCartItem->id)->increment('quantity', $item->quantity);
            } else {
                $cart->items()->create([
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->variant->backorder_allowed ? $item->quantity : min($item->quantity, $item->variant->stock_quantity),
                ]);
            }

            $addedCount++;
        }

        $suffix = $skippedCount > 0 ? sprintf(', %d unavailable', $skippedCount) : '';

        return $this->ok([
            'cart_token' => $cart->session_token,
            'added' => $addedCount,
            'skipped' => $skippedCount,
            'message' => sprintf('Added %d item(s) to cart%s.', $addedCount, $suffix),
        ]);
    }

    public function requestReturn(
        StoreReturnRequestRequest $request,
        string $reference,
        ReturnRequestService $returnRequestService,
    ): JsonResponse {
        $customer = $request->user()->customer;

        $order = Order::query()
            ->where('reference_number', $reference)
            ->where('customer_id', $customer?->id)
            ->with('items')
            ->firstOrFail();

        $returnRequest = $returnRequestService->createForOrder(
            $order,
            $request->validated(),
        );

        return $this->created([
            'message' => 'Return request submitted successfully',
            'reference_number' => $returnRequest->reference_number,
        ]);
    }

    public function trackGuest(Request $request): JsonResponse
    {
        $data = $request->validate([
            'reference_number' => ['required', 'string'],
            'email' => ['required', 'email'],
        ]);

        $order = Order::query()
            ->where('reference_number', $data['reference_number'])
            ->where(function ($query) use ($data): void {
                $query->where('guest_email', $data['email'])
                    ->orWhereHas('customer.user', function ($q) use ($data): void {
                        $q->where('email', $data['email']);
                    });
            })
            ->with(['items', 'payment', 'shipment', 'statusHistory'])
            ->first();

        abort_unless($order !== null, 404, 'Order not found with provided reference number and email.');

        return $this->ok([
            'reference_number' => $order->reference_number,
            'status' => $order->status->getValue(),
            'created_at' => $order->created_at,
            'subtotal' => $order->subtotal,
            'shipping_cost' => $order->shipping_cost,
            'discount_amount' => $order->discount_amount,
            'total' => $order->total,
            'currency_code' => $order->currency_code,
            'items' => $order->items->map(fn (OrderItem $item): array => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'variant_sku' => $item->sku,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
            ]),
            'payment' => $order->payment ? [
                'provider' => $order->payment->provider,
                'status' => $order->payment->status,
                'amount' => $order->payment->amount,
            ] : null,
            'shipment' => $order->shipment ? [
                'carrier' => $order->shipment->carrier,
                'tracking_number' => $order->shipment->tracking_number,
                'tracking_url' => $order->shipment->tracking_url,
                'status' => $order->shipment->status,
                'shipped_at' => $order->shipment->updated_at,
            ] : null,
            'status_history' => $order->statusHistory->map(fn ($h): array => [
                'new_status' => $h->new_status,
                'notes' => $h->notes,
                'changed_at' => $h->changed_at,
            ]),
        ]);
    }
}
