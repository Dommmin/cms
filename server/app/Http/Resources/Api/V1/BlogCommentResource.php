<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\BlogComment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin BlogComment
 */
class BlogCommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'parent_id' => $this->parent_id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'replies' => self::collection($this->whenLoaded('replies')),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
