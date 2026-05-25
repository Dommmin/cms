<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $slug
 * @property array<string, string>|null $slug_translations
 * @property string|null $translation_group_id
 * @property string|null $seo_description
 * @property string|null $canonical_url
 *
 * @mixin BlogPost
 */
class BlogPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = (string) ($request->query('locale') ?? app()->getLocale());
        $availableLocales = $this->availableLocaleCodes();

        return [
            'id' => $this->id,
            'title' => $this->getTranslation('title', $locale, true),
            'slug' => $this->getTranslation('slug', $locale, false),
            'canonical_slug' => $this->getTranslation('slug', config('app.locale'), false),
            'slug_translations' => $this->getTranslations('slug'),
            'available_locales' => $availableLocales,
            'translation_group_id' => $this->translation_group_id,
            'excerpt' => $this->getTranslation('excerpt', $locale, true),
            'content' => $this->getTranslation('content', $locale, true),
            'content_type' => $this->content_type,
            'status' => $this->status,
            'featured_image' => $this->featured_image,
            'tags' => $this->whenLoaded('tags', fn (): array => $this->tags->pluck('name')->values()->all(), []),
            'is_featured' => $this->is_featured,
            'views_count' => $this->views_count,
            'reading_time' => $this->reading_time,
            'published_at' => $this->published_at?->toIso8601String(),
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'meta_description' => $this->seo_description,
            'canonical_url' => $this->canonical_url,
            'meta_robots' => $this->meta_robots ?? 'index, follow',
            'og_image' => $this->og_image,
            'sitemap_exclude' => (bool) $this->sitemap_exclude,
            'votes_up' => $this->whenLoaded('votes', fn (): int => $this->votes->where('vote', 'up')->count()),
            'votes_down' => $this->whenLoaded('votes', fn (): int => $this->votes->where('vote', 'down')->count()),
            'user_vote' => $this->when(
                $this->relationLoaded('votes') && $request->user(),
                fn (): ?string => $this->votes->firstWhere('user_id', $request->user()?->id)?->vote
            ),
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
