<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Enums\ShipmentStatusEnum;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\ShipmentItem;

class ShipmentService
{
    /**
     * Create a partial shipment for selected order items.
     *
     * @param  array<int, array{order_item_id: int, quantity: int}>  $items
     * @param  array{carrier?: string|null, tracking_number?: string|null, tracking_url?: string|null}  $shipmentData
     */
    public function createPartialShipment(Order $order, array $items, array $shipmentData): Shipment
    {
        $shipment = $order->shipments()->create([
            'shipping_method_id' => $order->shipping_method_id ?? null,
            'carrier' => $shipmentData['carrier'] ?? null,
            'tracking_number' => $shipmentData['tracking_number'] ?? null,
            'tracking_url' => $shipmentData['tracking_url'] ?? null,
            'status' => ShipmentStatusEnum::PENDING,
        ]);

        foreach ($items as $item) {
            $orderItem = $order->items()->findOrFail($item['order_item_id']);
            $quantity = min((int) $item['quantity'], $orderItem->remaining_to_ship);

            if ($quantity <= 0) {
                continue;
            }

            ShipmentItem::create([
                'shipment_id' => $shipment->id,
                'order_item_id' => $orderItem->id,
                'quantity' => $quantity,
            ]);

            $orderItem->increment('shipped_quantity', $quantity);
        }

        $this->updateOrderFulfillmentStatus($order);

        return $shipment->load('items.orderItem');
    }

    /**
     * Update order status based on how many items are shipped.
     */
    public function updateOrderFulfillmentStatus(Order $order): void
    {
        $order->loadMissing('items');

        $allShipped = $order->items->every(fn (mixed $item): bool => $item->isFullyShipped());
        $anyShipped = $order->items->some(fn (mixed $item): bool => $item->shipped_quantity > 0);

        if ($allShipped && $order->status->getValue() !== OrderStatusEnum::SHIPPED->value) {
            $order->changeStatus(OrderStatusEnum::SHIPPED, changedBy: 'system', notes: 'All items shipped');
        } elseif ($anyShipped && ! $allShipped) {
            // Partial shipment — no automatic status change, order stays in processing
        }
    }
}
