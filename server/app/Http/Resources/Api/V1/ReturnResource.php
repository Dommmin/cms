<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Enums\ReturnItemConditionEnum;
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
            'return_type' => $return->return_type->value,
            'status' => $return->status->value,
            'reason' => $return->reason,
            'customer_notes' => $return->customer_notes,
            'admin_notes' => $return->admin_notes,
            'refund_amount' => $return->refund_amount,
            'return_tracking_number' => $return->return_tracking_number,
            'created_at' => $return->created_at->toISOString(),
            'items' => $return->relationLoaded('items')
                ? $return->items->map(fn ($item): array => [
                    'quantity' => (int) $item->getAttribute('quantity'),
                    'condition' => $item->getAttribute('condition') instanceof ReturnItemConditionEnum
                        ? $item->getAttribute('condition')->value
                        : (string) $item->getAttribute('condition'),
                    'product_name' => $item->getAttribute('orderItem')
                        ? $item->getAttribute('orderItem')->getAttribute('product_name')
                        : null,
                ])
                : [],
        ];
    }
}
