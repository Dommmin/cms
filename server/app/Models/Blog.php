<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class Blog extends Model
{
    use HasFactory;
    use HasTranslations;

    /** @var array<int, string> */
    public array $translatable = ['name', 'description'];

    protected $fillable = [
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
    ];

    public static function findBySlug(string $slug): ?self
    {
        return self::query()->where('slug', $slug)->first();
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
