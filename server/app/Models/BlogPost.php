<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetafields;
use App\Concerns\HasTags;
use App\Concerns\HasVersions;
use App\Concerns\SanitizesTranslatableHtml;
use App\Enums\BlogPostStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property array<string, string>|null $slug_translations
 * @property string|null $content
 * @property string|null $excerpt
 * @property array<string, mixed>|null $content_json
 * @property BlogPostStatusEnum|string|null $status
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property string|null $canonical_url
 * @property int|null $reading_time
 * @property string|null $translation_group_id
 * @property array<string, string>|null $available_locales
 */
#[Fillable([
    'user_id',
    'blog_id',
    'blog_category_id',
    'title',
    'slug',
    'slug_translations',
    'excerpt',
    'content',
    'content_json',
    'content_type',
    'status',
    'featured_image',
    'available_locales',
    'translation_group_id',
    'is_featured',
    'published_at',
    'reading_time',
    'seo_title',
    'seo_description',
    'canonical_url',
    'meta_robots',
    'og_image',
    'sitemap_exclude',
])]
class BlogPost extends Model
{
    use HasFactory;
    use HasMetafields;
    use HasTags;
    use HasTranslations;
    use HasVersions;
    use LogsActivity;
    use SanitizesTranslatableHtml;

    /** @var array<int, string> */
    public array $translatable = ['title', 'excerpt', 'content'];

    /** @var array<int, string> */
    protected array $htmlAttributes = ['content', 'excerpt'];

    /** @var array<int, string> */
    protected array $versionedAttributes = [
        'title', 'slug', 'excerpt', 'content', 'content_json',
        'status', 'is_featured', 'available_locales',
    ];

    protected int $maxVersions = 30;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'slug', 'status', 'is_featured', 'available_locales'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('blog_post');
    }

    public function blog(): BelongsTo
    {
        return $this->belongsTo(Blog::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    /** @return HasMany<BlogComment, $this> */
    public function comments(): HasMany
    {
        /** @var HasMany<BlogComment, $this> $relation */
        $relation = $this->hasMany(BlogComment::class)->whereNull('parent_id')->where('is_approved', true);

        return $relation;
    }

    /** @return HasMany<BlogPostVote, $this> */
    public function votes(): HasMany
    {
        return $this->hasMany(BlogPostVote::class);
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function estimateReadingTime(string $content): int
    {
        $wordCount = str_word_count(strip_tags($content));

        return (int) max(1, ceil($wordCount / 200));
    }

    public function slugForLocale(string $locale): string
    {
        $translations = $this->slug_translations ?? [];

        return $translations[$locale] ?? $this->slug;
    }

    public function availableLocaleCodes(): array
    {
        if (is_array($this->available_locales) && $this->available_locales !== []) {
            return array_values(array_unique($this->available_locales));
        }

        $locales = array_unique(array_merge(
            array_keys($this->getTranslations('title')),
            array_keys($this->getTranslations('content')),
            array_keys($this->slug_translations ?? []),
        ));

        return array_values(array_filter($locales, fn (string $locale): bool => $locale !== ''));
    }

    #[Scope]
    protected function published(Builder $query): Builder
    {
        return $query->where('status', BlogPostStatusEnum::Published);
    }

    #[Scope]
    protected function draft(Builder $query): Builder
    {
        return $query->where('status', BlogPostStatusEnum::Draft);
    }

    #[Scope]
    protected function featured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    protected function casts(): array
    {
        return [
            'available_locales' => 'array',
            'slug_translations' => 'array',
            'content_json' => 'array',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'status' => BlogPostStatusEnum::class,
            'views_count' => 'integer',
            'reading_time' => 'integer',
            'sitemap_exclude' => 'boolean',
        ];
    }
}
