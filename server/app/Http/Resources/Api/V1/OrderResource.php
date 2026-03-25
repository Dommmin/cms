<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Order $order */
        $order = $this->resource;

        return [
            'id' => $order->id,
            'reference_number' => $order->reference_number,
            'status' => (string) $order->status,
            'status_label' => OrderStatusEnum::from((string) $order->status)->getLabel(),
            'subtotal' => $order->subtotal,
            'discount_amount' => $order->discount_amount,
            'shipping_cost' => $order->shipping_cost,
            'tax_amount' => $order->tax_amount,
            'total' => $order->total,
            'currency_code' => $order->currency_code,
            'notes' => $order->notes,
            'created_at' => $order->created_at?->toISOString(),
            'items' => $order->relationLoaded('items') ? OrderItemResource::collection($order->items) : [],
            'billing_address' => $order->relationLoaded('billingAddress') ? new AddressResource($order->billingAddress) : null,
            'shipping_address' => $order->relationLoaded('shippingAddress') ? new AddressResource($order->shippingAddress) : null,
            'payment' => $order->relationLoaded('payment') && $order->payment ? [
                'provider' => $order->payment->provider->value,
                'status' => $order->payment->status->value,
                'amount' => $order->payment->amount,
            ] : null,
            'shipment' => $order->relationLoaded('shipment') && $order->shipment ? [
                'carrier' => $order->shipment->carrier,
                'tracking_number' => $order->shipment->tracking_number,
                'status' => $order->shipment->status->value,
            ] : null,
            'status_history' => $order->relationLoaded('statusHistory')
                ? $order->statusHistory->map(fn ($h): array => [
                    'status' => $h->status,
                    'note' => $h->note,
                    'created_at' => $h->created_at?->toISOString(),
                ])
                : [],
        ];
    }
}
