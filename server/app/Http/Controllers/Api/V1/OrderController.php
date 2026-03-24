<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return OrderResource::collection(collect());
        }

        $orders = Order::query()
            ->where('customer_id', $customer->id)
            ->with(['items'])
            ->orderBy('created_at', 'desc')
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
            ->with(['items', 'billingAddress', 'shippingAddress', 'payment', 'shipment', 'statusHistory'])
            ->firstOrFail();

        return response()->json(['data' => new OrderResource($order)]);
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
            return response()->json(['message' => 'Order cannot be cancelled in its current status'], 422);
        }

        $order->changeStatus(OrderStatusEnum::CANCELLED, 'customer', 'Cancelled by customer');

        return response()->json(['data' => new OrderResource($order->fresh())]);
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

    public function requestReturn(Request $request, string $reference): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'type' => ['required', 'string', 'in:return,complaint,exchange'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.order_item_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string'],
        ]);

        $customer = $request->user()->customer;

        $order = Order::query()
            ->where('reference_number', $reference)
            ->where('customer_id', $customer?->id)
            ->with('items')
            ->firstOrFail();

        if (OrderStatusEnum::from((string) $order->status) !== OrderStatusEnum::DELIVERED) {
            return response()->json(['message' => 'Returns can only be requested for delivered orders'], 422);
        }

        $returnRequest = ReturnRequest::query()->create([
            'order_id' => $order->id,
            'reference_number' => ReturnRequest::generateReferenceNumber(),
            'return_type' => $request->type,
            'status' => 'pending',
            'reason' => $request->reason,
            'customer_notes' => $request->notes,
        ]);

        foreach ($request->items as $itemData) {
            $orderItem = $order->items->where('id', $itemData['order_item_id'])->first();
            if ($orderItem) {
                $returnRequest->items()->create([
                    'order_item_id' => $orderItem->id,
                    'quantity' => min($itemData['quantity'], $orderItem->quantity),
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }
        }

        return response()->json([
            'message' => 'Return request submitted successfully',
            'reference_number' => $returnRequest->reference_number,
        ], 201);
    }
}
