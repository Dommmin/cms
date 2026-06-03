<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\ReturnItem;
use App\Models\ReturnRequest;
use App\Models\ReturnStatusHistory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ReturnRequest
 */
class ReturnResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var ReturnRequest $return */
        $return = $this->resource;

        return [
            'id' => $return->id,
            'reference_number' => $return->reference_number,
            'return_type' => $return->return_type->value,
            'status' => $return->status->value,
            'order_reference_number' => $return->relationLoaded('order')
                ? $return->order->reference_number
                : null,
            'reason' => $return->reason,
            'customer_notes' => $return->customer_notes,
            'admin_notes' => $return->admin_notes,
            'refund_amount' => $return->refund_amount,
            'return_tracking_number' => $return->return_tracking_number,
            'created_at' => $return->created_at->toISOString(),
            'status_history' => $return->relationLoaded('statusHistory')
                ? $return->statusHistory->map(fn (ReturnStatusHistory $history): array => [
                    'previous_status' => $history->previous_status,
                    'new_status' => $history->new_status,
                    'changed_by' => $history->changed_by,
                    'notes' => $history->notes,
                    'changed_at' => $history->changed_at->toISOString(),
                ])->values()->all()
                : [],
            'items' => $return->relationLoaded('items')
                ? $return->items->map(function (Model $model): array {
                    /** @var ReturnItem $item */
                    $item = $model;

                    return [
                        'order_item_id' => $item->order_item_id,
                        'quantity' => $item->quantity,
                        'condition' => $item->condition?->value,
                        'product_name' => $item->orderItem->product_name,
                        'notes' => $item->notes,
                    ];
                })->values()->all()
                : [],
        ];
    }
}
