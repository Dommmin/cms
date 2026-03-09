<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin SupportMessage
 */
class SupportMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var SupportMessage $message */
        $message = $this->resource;

        return [
            'id' => $message->id,
            'sender_type' => $message->sender_type,
            'sender_name' => $message->sender_name,
            'body' => $message->body,
            'is_internal' => $message->is_internal,
            'read_at' => $message->read_at?->toISOString(),
            'created_at' => $message->created_at?->toISOString(),
        ];
    }
}
