<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Services\ReturnEligibilityService;
use Carbon\Carbon;
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
        $returnEligibility = null;
        $items = [];

        if ($order->relationLoaded('items')) {
            $returnEligibility = resolve(ReturnEligibilityService::class)->buildForOrder($order);
            $itemEligibility = collect($returnEligibility['items'])->keyBy('order_item_id');
            $items = OrderItemResource::collection($order->items)
                ->resolve($request);
            $items = array_map(
                fn (array $item): array => [
                    ...$item,
                    'return_eligibility' => $itemEligibility->get($item['id']),
                ],
                $items,
            );
        }

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
            'created_at' => $order->created_at->toISOString(),
            'items' => $items,
            'billing_address' => $order->relationLoaded('billingAddress') ? new AddressResource($order->billingAddress) : null,
            'shipping_address' => $order->relationLoaded('shippingAddress') ? new AddressResource($order->shippingAddress) : null,
            'payment' => $order->relationLoaded('payment') && $order->payment ? [
                'provider' => $order->payment->provider->value,
                'status' => $order->payment->status->value,
                'amount' => $order->payment->amount,
                'redirect_url' => $order->payment->getRedirectUrl(),
            ] : null,
            'shipment' => $order->relationLoaded('shipment') && $order->shipment ? [
                'carrier' => $order->shipment->carrier,
                'tracking_number' => $order->shipment->tracking_number,
                'tracking_url' => $order->shipment->tracking_url,
                'status' => $order->shipment->status->value,
            ] : null,
            'status_history' => $order->relationLoaded('statusHistory')
                ? array_map(function (OrderStatusHistory $h): array {
                    $createdAt = $h->getAttribute('created_at');

                    return [
                        'status' => $h->getAttribute('status'),
                        'note' => $h->getAttribute('note'),
                        'created_at' => $createdAt instanceof Carbon ? $createdAt->toISOString() : null,
                    ];
                }, $order->statusHistory->all())
                : [],
            'returns' => $order->relationLoaded('returns')
                ? ReturnResource::collection($order->returns)
                : [],
            'return_eligibility' => $returnEligibility,
        ];
    }
}
