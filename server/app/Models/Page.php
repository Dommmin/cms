<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PageLayoutEnum;
use App\Enums\PageTypeEnum;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property int|null $parent_id
 * @property string $title
 * @property string $slug
 * @property string|null $content
 * @property string|null $rich_content
 * @property string|null $excerpt
 * @property PageLayoutEnum $layout
 * @property array<string, mixed>|null $builder_snapshot
 * @property PageTypeEnum $page_type
 * @property string|null $module_name
 * @property array<string, mixed>|null $module_config
 * @property int|null $theme_id
 * @property bool $is_published
 * @property int|null $published_version_id
 * @property int|null $draft_version_id
 * @property CarbonInterface|null $published_at
 * @property int $position
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property string|null $seo_canonical
 * @property array<int, string>|null $available_locales
 * @property-read Page|null $parent
 * @property-read Collection<int, Page> $children
 * @property-read Collection<int, PageBlock> $blocks
 * @property-read Collection<int, PageBlock> $allBlocks
 * @property-read Collection<int, PageSection> $sections
 * @property-read Collection<int, PageSection> $allSections
 * @property-read Collection<int, PageBlock> $sectionBlocks
 * @property-read Collection<int, PageVersion> $versions
 * @property-read PageVersion|null $publishedVersion
 * @property-read PageVersion|null $draftVersion
 * @property-read Theme|null $theme
 */
class Page extends Model
{
    use HasFactory;
    use HasTranslations;
    use LogsActivity;

    /** @var array<int, string> */
    public array $translatable = ['title', 'excerpt', 'content', 'rich_content'];

    protected $table = 'pages';

    protected $fillable = [
        'parent_id', 'locale', 'title', 'slug', 'slug_translations', 'content', 'rich_content', 'excerpt', 'layout',
        'builder_snapshot', 'page_type', 'module_name', 'module_config',
        'theme_id', 'is_published', 'published_at', 'published_version_id', 'draft_version_id', 'position',
        'seo_title', 'seo_description', 'seo_canonical', 'meta_robots', 'og_image', 'sitemap_exclude', 'available_locales',
    ];

    /**
     * Find a published page by path segments (e.g. ['parent', 'child'] for URL /parent/child).
     */
    public static function findByPath(array $segments): ?self
    {
        if ($segments === []) {
            return null;
        }

        $page = null;
        foreach ($segments as $slug) {
            $query = self::query()->where('slug', $slug)->where('is_published', true);
            if ($page === null) {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $page->id);
            }

            $page = $query->first();
            if (! $page) {
                return null;
            }
        }

        return $page;
    }

    /**
     * Find a published page by locale-aware path segments.
     *
     * For each segment: first tries locale-specific page, then falls back to global (locale = null).
     * Each segment is matched against canonical slug OR slug_translations->{locale}.
     */
    public static function findByLocalizedPath(array $segments, string $locale = 'en'): ?self
    {
        if ($segments === []) {
            return null;
        }

        $page = null;
        foreach ($segments as $segment) {
            $page = self::findSegmentWithLocaleFallback($segment, $locale, $page?->id);
            if (! $page instanceof self) {
                return null;
            }
        }

        return $page;
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'slug', 'is_published', 'page_type', 'layout'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('page');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('position');
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(PageBlock::class, 'page_id')->where('is_active', true)->orderBy('position');
    }

    public function allBlocks(): HasMany
    {
        return $this->hasMany(PageBlock::class, 'page_id')->orderBy('position');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(PageSection::class, 'page_id')->where('is_active', true)->orderBy('position');
    }

    public function allSections(): HasMany
    {
        return $this->hasMany(PageSection::class, 'page_id')->orderBy('position');
    }

    public function sectionBlocks(): HasManyThrough
    {
        return $this->hasManyThrough(PageBlock::class, PageSection::class, 'page_id', 'section_id')
            ->where('page_blocks.is_active', true)
            ->orderBy('page_blocks.position');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(PageVersion::class, 'page_id')->orderByDesc('version_number');
    }

    public function publishedVersion(): BelongsTo
    {
        return $this->belongsTo(PageVersion::class, 'published_version_id');
    }

    public function draftVersion(): BelongsTo
    {
        return $this->belongsTo(PageVersion::class, 'draft_version_id');
    }

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class, 'theme_id');
    }

    public function isBlocksType(): bool
    {
        return $this->page_type === PageTypeEnum::Blocks;
    }

    /** Strona zwraca treść rich text (moduł content). */
    public function isRichTextType(): bool
    {
        return $this->isContentModule();
    }

    public function isModuleType(): bool
    {
        return $this->page_type === PageTypeEnum::Module;
    }

    public function isContentModule(): bool
    {
        return $this->page_type === PageTypeEnum::Module && $this->module_name === 'content';
    }

    /**
     * Return the slug for a given locale, falling back to the canonical slug.
     */
    public function getSlugForLocale(string $locale): string
    {
        $translations = $this->slug_translations ?? [];

        return $translations[$locale] ?? $this->slug;
    }

    /**
     * Scope to filter pages by site locale.
     *
     * @param  string|null  $locale  'global' = whereNull('locale'), code = where('locale', code), null = no filter
     */
    #[Scope]
    protected function forLocale(Builder $query, ?string $locale): void
    {
        if ($locale === 'global') {
            $query->whereNull('locale');
        } elseif ($locale !== null) {
            $query->where('locale', $locale);
        }
    }

    /**
     * Scope to eager load full content with blocks
     */
    #[Scope]
    protected function withFullContent($query)
    {
        return $query->with([
            'sections' => function ($q): void {
                $q->orderBy('position');
            },
            'sections.blocks' => function ($q): void {
                $q->orderBy('position');
            },
            'allSections' => function ($q): void {
                $q->orderBy('position');
            },
            'allSections.allBlocks' => function ($q): void {
                $q->orderBy('position');
            },
            'blocks' => function ($q): void {
                $q->orderBy('position');
            },
            'allBlocks' => function ($q): void {
                $q->orderBy('position');
            },
            'parent',
            'children',
            'theme',
        ]);
    }

    protected function casts(): array
    {
        return [
            'layout' => PageLayoutEnum::class,
            'page_type' => PageTypeEnum::class,
            'module_config' => 'array',
            'builder_snapshot' => 'array',
            'slug_translations' => 'array',
            'available_locales' => 'array',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'sitemap_exclude' => 'boolean',
        ];
    }

    /**
     * Find a single path segment, trying locale-specific first, then global fallback.
     */
    private static function findSegmentWithLocaleFallback(
        string $segment,
        string $locale,
        ?int $parentId
    ): ?self {
        $baseQuery = fn () => self::query()
            ->where('is_published', true)
            ->where(function ($q) use ($segment, $locale): void {
                $q->where('slug', $segment)
                    ->orWhere('slug_translations->'.$locale, $segment);
            })
            ->when($parentId === null,
                fn ($q) => $q->whereNull('parent_id'),
                fn ($q) => $q->where('parent_id', $parentId),
            );

        // 1. Locale-specific page (highest priority)
        $found = $baseQuery()->where('locale', $locale)->first();

        // 2. Global page fallback (locale = null)
        return $found ?? $baseQuery()->whereNull('locale')->first();
    }
}
