<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Blog
 */
class BlogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'layout' => $this->layout,
            'posts_per_page' => $this->posts_per_page,
            'commentable' => $this->commentable,
            'is_active' => $this->is_active,
            'available_locales' => $this->available_locales,
            'position' => $this->position,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'posts_count' => $this->whenCounted('posts'),
            'default_author' => $this->whenLoaded('defaultAuthor', fn (): ?array => $this->defaultAuthor ? [
                'id' => $this->defaultAuthor->id,
                'name' => $this->defaultAuthor->name,
            ] : null),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
