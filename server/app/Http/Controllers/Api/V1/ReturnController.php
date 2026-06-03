<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\LookupGuestReturnOrderRequest;
use App\Http\Requests\Api\V1\StoreGuestReturnRequestRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Http\Resources\Api\V1\ReturnResource;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Services\ReturnRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReturnController extends ApiController
{
    public function __construct(
        private readonly ReturnRequestService $returnRequestService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return ReturnResource::collection(ReturnRequest::query()->whereNull('id')->paginate(10));
        }

        $returns = ReturnRequest::query()
            ->whereHas('order', fn ($query) => $query->where('customer_id', $customer->id))
            ->with(['items.orderItem', 'order'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return ReturnResource::collection($returns);
    }

    public function show(Request $request, string $referenceNumber): JsonResponse
    {
        $customer = $request->user()->customer;

        $returnRequest = ReturnRequest::query()
            ->where('reference_number', $referenceNumber)
            ->whereHas('order', fn ($query) => $query->where('customer_id', $customer?->id))
            ->with(['items.orderItem', 'statusHistory', 'order'])
            ->firstOrFail();

        return $this->ok(new ReturnResource($returnRequest));
    }

    public function lookup(LookupGuestReturnOrderRequest $request): JsonResponse
    {
        $order = $this->findOrderForLookup(
            $request->validated('reference_number'),
            $request->validated('email'),
        );

        $order->load([
            'items',
            'billingAddress',
            'shippingAddress',
            'payment',
            'shipment',
            'statusHistory',
            'returns.items.orderItem',
            'returns.statusHistory',
        ]);

        return $this->ok(new OrderResource($order));
    }

    public function storeGuest(StoreGuestReturnRequestRequest $request): JsonResponse
    {
        $order = $this->findOrderForLookup(
            $request->validated('reference_number'),
            $request->validated('email'),
        );

        $order->loadMissing('items');

        $returnRequest = $this->returnRequestService->createForOrder($order, $request->validated());

        return $this->created([
            'message' => 'Return request submitted successfully',
            'reference_number' => $returnRequest->reference_number,
        ]);
    }

    private function findOrderForLookup(string $referenceNumber, string $email): Order
    {
        return Order::query()
            ->where('reference_number', $referenceNumber)
            ->where(function ($query) use ($email): void {
                $query->where('guest_email', $email)
                    ->orWhereHas('customer', fn ($customerQuery) => $customerQuery->where('email', $email));
            })
            ->firstOrFail();
    }
}
