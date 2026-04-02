<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasVersions;
use App\Enums\BlogPostStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Translatable\HasTranslations;

class BlogPost extends Model
{
    use HasFactory;
    use HasTranslations;
    use HasVersions;
    use LogsActivity;

    /** @var array<int, string> */
    public array $translatable = ['title', 'excerpt', 'content'];

    /** @var array<int, string> */
    protected array $versionedAttributes = [
        'title', 'slug', 'excerpt', 'content',
        'status', 'is_featured', 'available_locales',
    ];

    protected int $maxVersions = 30;

    protected $fillable = [
        'user_id',
        'blog_category_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'content_type',
        'status',
        'featured_image',
        'tags',
        'available_locales',
        'is_featured',
        'published_at',
        'reading_time',
        'seo_title',
        'seo_description',
        'meta_robots',
        'og_image',
        'sitemap_exclude',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'slug', 'status', 'is_featured', 'available_locales'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('blog_post');
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
            'tags' => 'array',
            'available_locales' => 'array',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'status' => BlogPostStatusEnum::class,
            'views_count' => 'integer',
            'reading_time' => 'integer',
            'sitemap_exclude' => 'boolean',
        ];
    }
}
