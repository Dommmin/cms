<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property array<array-key, mixed> $name
 * @property array<array-key, mixed>|null $slug
 * @property array<array-key, mixed>|null $description
 * @property string $layout
 * @property int $posts_per_page
 * @property bool $commentable
 * @property int|null $default_author_id
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property bool $is_active
 * @property array<array-key, mixed>|null $available_locales
 * @property int $position
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $defaultAuthor
 * @property-read array $translatable_columns_from
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BlogPost> $posts
 * @property-read int|null $posts_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BlogPost> $publishedPosts
 * @property-read int|null $published_posts_count
 * @property-read mixed $translations
 * @method static Builder<static>|Blog active()
 * @method static \Database\Factories\BlogFactory factory($count = null, $state = [])
 * @method static Builder<static>|Blog newModelQuery()
 * @method static Builder<static>|Blog newQuery()
 * @method static Builder<static>|Blog query()
 * @method static Builder<static>|Blog whereAvailableLocales($value)
 * @method static Builder<static>|Blog whereCommentable($value)
 * @method static Builder<static>|Blog whereCreatedAt($value)
 * @method static Builder<static>|Blog whereDefaultAuthorId($value)
 * @method static Builder<static>|Blog whereDescription($value)
 * @method static Builder<static>|Blog whereId($value)
 * @method static Builder<static>|Blog whereIsActive($value)
 * @method static Builder<static>|Blog whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Blog whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Blog whereLayout($value)
 * @method static Builder<static>|Blog whereLocale(string $column, string $locale)
 * @method static Builder<static>|Blog whereLocales(string $column, array $locales)
 * @method static Builder<static>|Blog whereName($value)
 * @method static Builder<static>|Blog wherePosition($value)
 * @method static Builder<static>|Blog wherePostsPerPage($value)
 * @method static Builder<static>|Blog whereSeoDescription($value)
 * @method static Builder<static>|Blog whereSeoTitle($value)
 * @method static Builder<static>|Blog whereSlug($value)
 * @method static Builder<static>|Blog whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'name',
    'slug',
    'description',
    'layout',
    'posts_per_page',
    'commentable',
    'default_author_id',
    'seo_title',
    'seo_description',
    'is_active',
    'available_locales',
    'position',
])]
class Blog extends Model
{
    use HasFactory;
    use HasTranslations;

    /** @var array<int, string> */
    public array $translatable = ['name', 'slug', 'description'];

    public static function findBySlug(string $slug, string $locale = 'en'): ?self
    {
        return self::query()->where('slug->'.$locale, $slug)->first();
    }

    /** @return HasMany<BlogPost, $this> */
    public function posts(): HasMany
    {
        return $this->hasMany(BlogPost::class);
    }

    /** @return HasMany<BlogPost, $this> */
    public function publishedPosts(): HasMany
    {
        return $this->hasMany(BlogPost::class)->where('status', 'published');
    }

    /** @return BelongsTo<User, $this> */
    public function defaultAuthor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'default_author_id');
    }

    /** @param Builder<Blog> $query */
    protected function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    protected function casts(): array
    {
        return [
            'commentable' => 'boolean',
            'is_active' => 'boolean',
            'available_locales' => 'array',
            'posts_per_page' => 'integer',
            'position' => 'integer',
        ];
    }
}
