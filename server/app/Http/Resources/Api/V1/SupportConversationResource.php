<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\SupportConversation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin SupportConversation
 */
class SupportConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var SupportConversation $conversation */
        $conversation = $this->resource;

        return [
            'id' => $conversation->id,
            'token' => $conversation->token,
            'subject' => $conversation->subject,
            'status' => $conversation->status->value,
            'channel' => $conversation->channel->value,
            'email' => $conversation->email,
            'name' => $conversation->name,
            'last_reply_at' => $conversation->last_reply_at?->toISOString(),
            'created_at' => $conversation->created_at?->toISOString(),
            'messages' => $conversation->relationLoaded('messages')
                ? SupportMessageResource::collection($conversation->messages)
                : [],
        ];
    }
}
