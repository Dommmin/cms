<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetafields;
use App\Concerns\HasTags;
use App\Concerns\SanitizesTranslatableHtml;
use App\Enums\PageLayoutEnum;
use App\Enums\PageTypeEnum;
use App\Traits\HasSeoMetadata;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property int $version
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
 * @property string|null $system_page_key
 * @property array<string, mixed>|null $module_config
 * @property int|null $theme_id
 * @property bool $is_published
 * @property int|null $published_version_id
 * @property int|null $draft_version_id
 * @property CarbonInterface|null $published_at
 * @property CarbonInterface|null $scheduled_publish_at
 * @property CarbonInterface|null $scheduled_unpublish_at
 * @property string|null $approval_status
 * @property int|null $reviewer_id
 * @property string|null $review_note
 * @property CarbonInterface|null $submitted_for_review_at
 * @property CarbonInterface|null $approved_at
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
 * @property string|null $locale null = global (fallback for all locales), or locale code e.g. pl, en
 * @property int|null $page_module_id
 * @property string|null $module_type
 * @property int|null $module_layout_id
 * @property string|null $module_configuration
 * @property int $is_draft
 * @property int $is_auto_generated
 * @property string|null $auto_gen_pattern
 * @property string $meta_robots
 * @property string|null $og_image
 * @property bool $sitemap_exclude
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read int|null $all_blocks_count
 * @property-read int|null $all_sections_count
 * @property-read int|null $blocks_count
 * @property-read int|null $children_count
 * @property-read array $translatable_columns_from
 * @property-read Collection<int, Metafield> $metafields
 * @property-read int|null $metafields_count
 * @property-read int|null $section_blocks_count
 * @property-read int|null $sections_count
 * @property-read Collection<int, Tag> $tags
 * @property-read int|null $tags_count
 * @property-read mixed $translations
 * @property-read int|null $versions_count
 *
 * @method static PageFactory factory($count = null, $state = [])
 * @method static Builder<static>|Page forLocale(?string $locale)
 * @method static Builder<static>|Page newModelQuery()
 * @method static Builder<static>|Page newQuery()
 * @method static Builder<static>|Page query()
 * @method static Builder<static>|Page whereApprovalStatus($value)
 * @method static Builder<static>|Page whereApprovedAt($value)
 * @method static Builder<static>|Page whereAutoGenPattern($value)
 * @method static Builder<static>|Page whereAvailableLocales($value)
 * @method static Builder<static>|Page whereBuilderSnapshot($value)
 * @method static Builder<static>|Page whereContent($value)
 * @method static Builder<static>|Page whereCreatedAt($value)
 * @method static Builder<static>|Page whereDraftVersionId($value)
 * @method static Builder<static>|Page whereExcerpt($value)
 * @method static Builder<static>|Page whereId($value)
 * @method static Builder<static>|Page whereIsAutoGenerated($value)
 * @method static Builder<static>|Page whereIsDraft($value)
 * @method static Builder<static>|Page whereIsPublished($value)
 * @method static Builder<static>|Page whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Page whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Page whereLayout($value)
 * @method static Builder<static>|Page whereLocale($value)
 * @method static Builder<static>|Page whereLocales(string $column, array $locales)
 * @method static Builder<static>|Page whereMetaRobots($value)
 * @method static Builder<static>|Page whereModuleConfig($value)
 * @method static Builder<static>|Page whereModuleConfiguration($value)
 * @method static Builder<static>|Page whereModuleLayoutId($value)
 * @method static Builder<static>|Page whereModuleName($value)
 * @method static Builder<static>|Page whereModuleType($value)
 * @method static Builder<static>|Page whereOgImage($value)
 * @method static Builder<static>|Page wherePageModuleId($value)
 * @method static Builder<static>|Page wherePageType($value)
 * @method static Builder<static>|Page whereParentId($value)
 * @method static Builder<static>|Page wherePosition($value)
 * @method static Builder<static>|Page wherePublishedAt($value)
 * @method static Builder<static>|Page wherePublishedVersionId($value)
 * @method static Builder<static>|Page whereReviewNote($value)
 * @method static Builder<static>|Page whereReviewerId($value)
 * @method static Builder<static>|Page whereRichContent($value)
 * @method static Builder<static>|Page whereScheduledPublishAt($value)
 * @method static Builder<static>|Page whereScheduledUnpublishAt($value)
 * @method static Builder<static>|Page whereSeoCanonical($value)
 * @method static Builder<static>|Page whereSeoDescription($value)
 * @method static Builder<static>|Page whereSeoTitle($value)
 * @method static Builder<static>|Page whereSitemapExclude($value)
 * @method static Builder<static>|Page whereSlug($value)
 * @method static Builder<static>|Page whereSubmittedForReviewAt($value)
 * @method static Builder<static>|Page whereSystemPageKey($value)
 * @method static Builder<static>|Page whereThemeId($value)
 * @method static Builder<static>|Page whereTitle($value)
 * @method static Builder<static>|Page whereUpdatedAt($value)
 * @method static Builder<static>|Page whereVersion($value)
 * @method static Builder<static>|Page withFullContent()
 *
 * @mixin Model
 */
#[Fillable([
    'parent_id', 'locale', 'title', 'slug', 'content', 'rich_content', 'excerpt', 'layout',
    'builder_snapshot', 'page_type', 'module_name', 'system_page_key', 'module_config',
    'theme_id', 'is_published', 'published_at', 'scheduled_publish_at', 'scheduled_unpublish_at',
    'published_version_id', 'draft_version_id', 'position',
    'seo_title', 'seo_description', 'seo_canonical', 'meta_robots', 'og_image', 'sitemap_exclude', 'available_locales',
    'approval_status', 'reviewer_id', 'review_note', 'submitted_for_review_at', 'approved_at',
])]
#[Table(name: 'pages')]
class Page extends Model
{
    use HasFactory;
    use HasMetafields;
    use HasSeoMetadata;
    use HasTags;
    use HasTranslations;
    use LogsActivity;
    use SanitizesTranslatableHtml;

    /** @var array<int, string> */
    public array $translatable = ['title', 'slug', 'excerpt', 'content', 'rich_content'];

    /** @var array<int, string> */
    protected array $htmlAttributes = ['content', 'rich_content', 'excerpt'];

    /**
     * Find a published page by path segments (e.g. ['parent', 'child'] for URL /parent/child).
     */
    public static function findByPath(array $segments): ?self
    {
        if ($segments === []) {
            return null;
        }

        $locale = app()->getLocale();
        $page = null;
        foreach ($segments as $segment) {
            $query = self::query()
                ->where(function ($q) use ($segment, $locale): void {
                    $q->where('slug->'.$locale, $segment);
                })
                ->where('is_published', true);
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
     * Each segment is matched against the locale-specific slug translation.
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

    public static function findPublishedBySystemPageKey(
        string $systemPageKey,
        ?string $locale = null,
    ): ?self {
        $resolvedLocale = $locale ?? app()->getLocale();

        $baseQuery = self::query()
            ->where('is_published', true)
            ->where('system_page_key', $systemPageKey);

        $localized = (clone $baseQuery)
            ->where('locale', $resolvedLocale)
            ->first();

        return $localized ?? (clone $baseQuery)->whereNull('locale')->first();
    }

    public function localizedSlug(string $locale): ?string
    {
        $slug = $this->getTranslation('slug', $locale, false);

        if (is_string($slug) && $slug !== '') {
            return $slug;
        }

        $fallback = $this->getTranslation('slug', config('app.locale'), false);

        return is_string($fallback) && $fallback !== '' ? $fallback : null;
    }

    public function localizedPath(string $locale): string
    {
        $this->loadMissing('parent');

        $segments = [];
        $current = $this;

        while ($current instanceof self) {
            $slug = $current->localizedSlug($locale);

            if (is_string($slug) && $slug !== '') {
                array_unshift($segments, $slug);
            }

            $current = $current->parent;
        }

        return '/'.implode('/', $segments);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'slug', 'is_published', 'page_type', 'layout'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
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
        return $this->getTranslation('slug', $locale, false) ?? '';
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
            'available_locales' => 'array',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'scheduled_publish_at' => 'datetime',
            'scheduled_unpublish_at' => 'datetime',
            'sitemap_exclude' => 'boolean',
            'submitted_for_review_at' => 'datetime',
            'approved_at' => 'datetime',
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
        $baseQuery = fn (string $loc) => self::query()
            ->where('is_published', true)
            ->where(function ($q) use ($segment, $loc): void {
                $q->where('slug->'.$loc, $segment);
            })
            ->when($parentId === null,
                fn ($q) => $q->whereNull('parent_id'),
                fn ($q) => $q->where('parent_id', $parentId),
            );

        $found = $baseQuery($locale)->where('locale', $locale)->first();

        $resolved = $found ?? $baseQuery($locale)->whereNull('locale')->first();

        // Alternate locale fallback: if not resolved, try matching the slug in other system locales
        if (! $resolved) {
            $otherLocales = $locale === 'en' ? ['pl'] : ['en'];
            foreach ($otherLocales as $altLoc) {
                $altFound = $baseQuery($altLoc)->where('locale', $altLoc)->first();
                $resolved = $altFound ?? $baseQuery($altLoc)->whereNull('locale')->first();
                if ($resolved) {
                    break;
                }
            }
        }

        if (! $resolved && $segment === 'home' && $parentId === null) {
            return self::query()
                ->where('is_published', true)
                ->where('locale', $locale)
                ->whereNull('parent_id')
                ->where('position', 1)
                ->first();
        }

        return $resolved;
    }
}
