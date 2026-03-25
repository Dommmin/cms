<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin BlogPost
 */
class BlogPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'content_type' => $this->content_type,
            'status' => $this->status,
            'featured_image' => $this->featured_image,
            'tags' => $this->tags ?? [],
            'is_featured' => $this->is_featured,
            'views_count' => $this->views_count,
            'reading_time' => $this->reading_time,
            'published_at' => $this->published_at?->toIso8601String(),
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'meta_robots' => $this->meta_robots ?? 'index, follow',
            'og_image' => $this->og_image,
            'sitemap_exclude' => (bool) $this->sitemap_exclude,
            'author' => $this->whenLoaded('author', fn (): array => [
                'id' => $this->author->id,
                'name' => $this->author->name,
            ]),
            'category' => $this->whenLoaded('category', fn (): ?array => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
