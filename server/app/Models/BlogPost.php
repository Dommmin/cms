<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetafields;
use App\Concerns\HasTags;
use App\Concerns\HasVersions;
use App\Concerns\SanitizesTranslatableHtml;
use App\Enums\BlogPostStatusEnum;
use App\Services\DefaultBlogResolver;
use App\Traits\HasSeoMetadata;
use Carbon\CarbonImmutable;
use Database\Factories\BlogPostFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Laravel\Scout\Searchable;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
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
 * @property int|null $blog_id
 * @property int|null $user_id
 * @property int|null $blog_category_id
 * @property string $content_type
 * @property int $views_count
 * @property string $meta_robots
 * @property string|null $og_image
 * @property bool $sitemap_exclude
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Blog|null $blog
 * @property-read BlogCategory|null $category
 * @property int|null $votes_up_count
 * @property int|null $votes_down_count
 * @property-read Collection<int, BlogComment> $comments
 * @property-read int|null $comments_count
 * @property-read array $translatable_columns_from
 * @property-read Collection<int, Metafield> $metafields
 * @property-read int|null $metafields_count
 * @property-read Collection<int, Tag> $tags
 * @property-read int|null $tags_count
 * @property-read mixed $translations
 * @property-read Collection<int, ModelVersion> $versions
 * @property-read int|null $versions_count
 * @property-read Collection<int, BlogPostVote> $votes
 * @property-read int|null $votes_count
 *
 * @method static Builder<static>|BlogPost draft()
 * @method static BlogPostFactory factory($count = null, $state = [])
 * @method static Builder<static>|BlogPost featured()
 * @method static Builder<static>|BlogPost newModelQuery()
 * @method static Builder<static>|BlogPost newQuery()
 * @method static Builder<static>|BlogPost published()
 * @method static Builder<static>|BlogPost query()
 * @method static Builder<static>|BlogPost whereAvailableLocales($value)
 * @method static Builder<static>|BlogPost whereBlogCategoryId($value)
 * @method static Builder<static>|BlogPost whereBlogId($value)
 * @method static Builder<static>|BlogPost whereCanonicalUrl($value)
 * @method static Builder<static>|BlogPost whereContent($value)
 * @method static Builder<static>|BlogPost whereContentJson($value)
 * @method static Builder<static>|BlogPost whereContentType($value)
 * @method static Builder<static>|BlogPost whereCreatedAt($value)
 * @method static Builder<static>|BlogPost whereExcerpt($value)
 * @method static Builder<static>|BlogPost whereFeaturedImage($value)
 * @method static Builder<static>|BlogPost whereId($value)
 * @method static Builder<static>|BlogPost whereIsFeatured($value)
 * @method static Builder<static>|BlogPost whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|BlogPost whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|BlogPost whereLocale(string $column, string $locale)
 * @method static Builder<static>|BlogPost whereLocales(string $column, array $locales)
 * @method static Builder<static>|BlogPost whereMetaRobots($value)
 * @method static Builder<static>|BlogPost whereOgImage($value)
 * @method static Builder<static>|BlogPost wherePublishedAt($value)
 * @method static Builder<static>|BlogPost whereReadingTime($value)
 * @method static Builder<static>|BlogPost whereSeoDescription($value)
 * @method static Builder<static>|BlogPost whereSeoTitle($value)
 * @method static Builder<static>|BlogPost whereSitemapExclude($value)
 * @method static Builder<static>|BlogPost whereSlug($value)
 * @method static Builder<static>|BlogPost whereStatus($value)
 * @method static Builder<static>|BlogPost whereTitle($value)
 * @method static Builder<static>|BlogPost whereTranslationGroupId($value)
 * @method static Builder<static>|BlogPost whereUpdatedAt($value)
 * @method static Builder<static>|BlogPost whereUserId($value)
 * @method static Builder<static>|BlogPost whereViewsCount($value)
 *
 * @mixin Model
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
    use HasSeoMetadata;
    use HasTags;
    use HasTranslations;
    use HasVersions;
    use LogsActivity;
    use SanitizesTranslatableHtml;
    use Searchable;

    /** @var array<int, string> */
    public array $translatable = ['title', 'slug', 'excerpt', 'content', 'seo_title', 'seo_description'];

    /** @var array<int, string> */
    protected array $htmlAttributes = ['content', 'excerpt'];

    /** @var array<int, string> */
    protected array $versionedAttributes = [
        'title', 'slug', 'excerpt', 'content', 'content_json',
        'status', 'is_featured', 'available_locales',
    ];

    protected int $maxVersions = 30;

    protected static function booted(): void
    {
        static::creating(function (self $post): void {
            if ($post->blog_id === null) {
                $post->blog_id = resolve(DefaultBlogResolver::class)->resolve()->id;
            }
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'slug', 'status', 'is_featured', 'available_locales'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
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

    protected function scopePublished(Builder $query): Builder
    {
        return $query->where('status', BlogPostStatusEnum::Published);
    }

    protected function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', BlogPostStatusEnum::Draft);
    }

    protected function scopeFeatured(Builder $query): Builder
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
