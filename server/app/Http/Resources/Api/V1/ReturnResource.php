<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Enums\ReturnItemConditionEnum;
use App\Enums\ReturnStatusEnum;
use App\Enums\ReturnTypeEnum;
use App\Models\ReturnRequest;
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
            'return_type' => $return->return_type instanceof ReturnTypeEnum
                ? $return->return_type->value
                : (string) $return->return_type,
            'status' => $return->status instanceof ReturnStatusEnum
                ? $return->status->value
                : (string) $return->status,
            'reason' => $return->reason,
            'customer_notes' => $return->customer_notes,
            'admin_notes' => $return->admin_notes,
            'refund_amount' => $return->refund_amount,
            'return_tracking_number' => $return->return_tracking_number,
            'created_at' => $return->created_at?->toISOString(),
            'items' => $return->relationLoaded('items')
                ? $return->items->map(fn ($item): array => [
                    'quantity' => $item->quantity,
                    'condition' => $item->condition instanceof ReturnItemConditionEnum
                        ? $item->condition->value
                        : (string) $item->condition,
                    'product_name' => $item->relationLoaded('orderItem') && $item->orderItem
                        ? $item->orderItem->product_name
                        : null,
                ])
                : [],
        ];
    }
}
