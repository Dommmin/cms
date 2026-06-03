<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\ReturnRequest;
use Illuminate\Validation\ValidationException;

class ReturnRequestService
{
    public function __construct(
        private readonly ReturnEligibilityService $returnEligibilityService,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function createForOrder(Order $order, array $data): ReturnRequest
    {
        $this->assertOrderEligible($order, (string) $data['type']);

        $normalizedItems = $this->normalizeItems($order, $data['items'] ?? []);

        $returnRequest = ReturnRequest::query()->create([
            'order_id' => $order->id,
            'reference_number' => ReturnRequest::generateReferenceNumber(),
            'return_type' => $data['type'],
            'status' => 'pending',
            'reason' => $data['reason'],
            'customer_notes' => $data['notes'] ?? null,
        ]);

        foreach ($normalizedItems as $item) {
            $returnRequest->items()->create($item);
        }

        return $returnRequest->load(['items.orderItem', 'statusHistory', 'order']);
    }

    public function assertOrderEligible(Order $order, string $type): void
    {
        $this->returnEligibilityService->assertOrderEligible($order, $type);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, array<string, mixed>>
     */
    private function normalizeItems(Order $order, array $items): array
    {
        $order->loadMissing(['items', 'returns.items', 'statusHistory']);
        $orderItems = $order->items->keyBy('id');
        $normalized = [];

        foreach ($items as $index => $itemData) {
            $orderItemId = (int) ($itemData['order_item_id'] ?? 0);
            $orderItem = $orderItems->get($orderItemId);

            if ($orderItem === null) {
                throw ValidationException::withMessages([
                    sprintf('items.%d.order_item_id', $index) => ['The selected order item does not belong to this order.'],
                ]);
            }

            $requestedQuantity = (int) ($itemData['quantity'] ?? 0);
            $eligibleQuantity = $this->returnEligibilityService->eligibleQuantity(
                $order,
                $orderItem->id,
            );

            if ($requestedQuantity < 1) {
                throw ValidationException::withMessages([
                    sprintf('items.%d.quantity', $index) => ['Quantity must be at least 1.'],
                ]);
            }

            if ($eligibleQuantity < 1) {
                throw ValidationException::withMessages([
                    sprintf('items.%d.order_item_id', $index) => ['This order item is no longer eligible for a new return request.'],
                ]);
            }

            if ($requestedQuantity > $eligibleQuantity) {
                throw ValidationException::withMessages([
                    sprintf('items.%d.quantity', $index) => [sprintf('Only %d item(s) remain eligible for this request.', $eligibleQuantity)],
                ]);
            }

            $normalized[] = [
                'order_item_id' => $orderItem->id,
                'quantity' => $requestedQuantity,
                'notes' => $itemData['notes'] ?? null,
            ];
        }

        if ($normalized === []) {
            throw ValidationException::withMessages([
                'items' => ['At least one valid order item is required.'],
            ]);
        }

        return $normalized;
    }
}
