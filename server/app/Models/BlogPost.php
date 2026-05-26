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
use Illuminate\Support\Carbon;
use Laravel\Scout\Searchable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property array<string, string>|string $title
 * @property array<string, string>|string $slug
 * @property array<string, string>|null $slug_translations
 * @property array<string, string>|string|null $content
 * @property array<string, string>|string|null $excerpt
 * @property array<string, mixed>|null $content_json
 * @property BlogPostStatusEnum|string|null $status
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property string|null $canonical_url
 * @property int|null $reading_time
 * @property string|null $translation_group_id
 * @property array<string, string>|null $available_locales
 * @property bool $is_featured
 * @property Carbon|null $published_at
 * @property string|null $featured_image
 * @property Carbon|null $created_at
 * @property User|null $author
 */
#[Fillable([
    'user_id',
    'blog_id',
    'blog_category_id',
    'title',
    'slug',
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
    use Searchable;

    /** @var array<int, string> */
    public array $translatable = ['title', 'slug', 'excerpt', 'content'];

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
        return $this->getTranslation('slug', $locale, false) ?? '';
    }

    public function availableLocaleCodes(): array
    {
        if (is_array($this->available_locales) && $this->available_locales !== []) {
            return array_values(array_unique($this->available_locales));
        }

        $locales = array_unique(array_merge(
            array_keys($this->getTranslations('title')),
            array_keys($this->getTranslations('content')),
            array_keys($this->getTranslations('slug')),
        ));

        return array_values(array_filter($locales, fn (string $locale): bool => $locale !== ''));
    }

    public function searchableAs(): string
    {
        return 'blog_posts';
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => (string) $this->id,
            'title' => is_array($this->title) ? ($this->title[app()->getLocale()] ?? reset($this->title)) : (string) $this->title,
            'slug' => is_array($this->slug) ? ($this->slug[app()->getLocale()] ?? reset($this->slug)) : (string) $this->slug,
            'excerpt' => is_array($this->excerpt) ? strip_tags((string) ($this->excerpt[app()->getLocale()] ?? reset($this->excerpt))) : strip_tags((string) $this->excerpt),
            'content' => is_array($this->content) ? strip_tags((string) ($this->content[app()->getLocale()] ?? reset($this->content))) : strip_tags((string) $this->content),
            'is_featured' => $this->is_featured ?? false,
            'status' => $this->status instanceof BlogPostStatusEnum ? $this->status->value : (string) $this->status,
            'published_at' => $this->published_at?->timestamp,
            'author_name' => $this->author?->name,
            'featured_image' => $this->featured_image,
            'created_at' => $this->created_at?->timestamp,
        ];
    }

    public function shouldBeSearchable(): bool
    {
        return $this->status === BlogPostStatusEnum::Published
            && (bool) Setting::get('search', 'index_blog_posts', true);
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
