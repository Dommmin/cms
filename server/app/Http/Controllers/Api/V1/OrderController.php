<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatusEnum;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\StoreReturnRequestRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Services\CartService;
use App\Services\InvoiceService;
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

    public function invoice(Request $request, string $reference, InvoiceService $invoiceService): Response
    {
        $customer = $request->user()->customer;

        $order = Order::query()
            ->where('reference_number', $reference)
            ->where('customer_id', $customer?->id)
            ->firstOrFail();

        return $invoiceService->download($order);
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
            if (! $item->variant || ! $item->variant->is_active || $item->variant->stock_quantity < 1) {
                $skippedCount++;

                continue;
            }

            $existingCartItem = $cart->items()->where('variant_id', $item->variant_id)->first();

            if ($existingCartItem) {
                $existingCartItem->increment('quantity', $item->quantity);
            } else {
                $cart->items()->create([
                    'variant_id' => $item->variant_id,
                    'quantity' => min($item->quantity, $item->variant->stock_quantity),
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

    public function requestReturn(StoreReturnRequestRequest $request, string $reference): JsonResponse
    {
        $customer = $request->user()->customer;

        $order = Order::query()
            ->where('reference_number', $reference)
            ->where('customer_id', $customer?->id)
            ->with('items')
            ->firstOrFail();

        if (OrderStatusEnum::from((string) $order->status) !== OrderStatusEnum::DELIVERED) {
            throw ValidationException::withMessages([
                'status' => ['Returns can only be requested for delivered orders'],
            ]);
        }

        $data = $request->validated();

        $returnRequest = ReturnRequest::query()->create([
            'order_id' => $order->id,
            'reference_number' => ReturnRequest::generateReferenceNumber(),
            'return_type' => $data['type'],
            'status' => 'pending',
            'reason' => $data['reason'],
            'customer_notes' => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $itemData) {
            $orderItem = $order->items->where('id', $itemData['order_item_id'])->first();
            if ($orderItem) {
                $returnRequest->items()->create([
                    'order_item_id' => $orderItem->id,
                    'quantity' => min($itemData['quantity'], $orderItem->quantity),
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }
        }

        return $this->created([
            'message' => 'Return request submitted successfully',
            'reference_number' => $returnRequest->reference_number,
        ]);
    }
}
