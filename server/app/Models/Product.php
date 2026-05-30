<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetafields;
use App\Concerns\HasTags;
use App\Concerns\HasVersions;
use App\Concerns\SanitizesTranslatableHtml;
use App\Enums\ReviewStatusEnum;
use Carbon\CarbonImmutable;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Scout\Searchable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property bool $is_search_promoted
 * @property bool $is_featured
 * @property bool $is_active
 * @property-read ProductImage|null $thumbnail
 * @property int $product_type_id
 * @property int $category_id
 * @property int|null $brand_id
 * @property array<array-key, mixed>|null $description
 * @property array<array-key, mixed>|null $short_description
 * @property string|null $sku_prefix
 * @property bool $is_saleable
 * @property CarbonImmutable|null $available_from
 * @property CarbonImmutable|null $available_until
 * @property string|null $seo_title
 * @property string|null $seo_description
 * @property string $meta_robots
 * @property string|null $og_image
 * @property bool $sitemap_exclude
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ProductVariant> $activeVariants
 * @property-read int|null $active_variants_count
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Brand|null $brand
 * @property-read Collection<int, Category> $categories
 * @property-read int|null $categories_count
 * @property-read Category $category
 * @property-read ProductVariant|null $defaultVariant
 * @property-read Collection<int, ProductFlag> $flags
 * @property-read int|null $flags_count
 * @property-read array $translatable_columns_from
 * @property-read Collection<int, ProductImage> $images
 * @property-read int|null $images_count
 * @property-read MediaCollection<int, Media> $media
 * @property-read int|null $media_count
 * @property-read Collection<int, Metafield> $metafields
 * @property-read int|null $metafields_count
 * @property-read ProductType $productType
 * @property-read Collection<int, Promotion> $promotions
 * @property-read int|null $promotions_count
 * @property-read Collection<int, ProductReview> $reviews
 * @property-read int|null $reviews_count
 * @property-read Collection<int, Tag> $tags
 * @property-read int|null $tags_count
 * @property-read mixed $translations
 * @property-read Collection<int, ProductVariant> $variants
 * @property-read int|null $variants_count
 * @property-read Collection<int, ModelVersion> $versions
 * @property-read int|null $versions_count
 * @property-read Collection<int, WishlistItem> $wishlistItems
 * @property-read int|null $wishlist_items_count
 *
 * @method static Builder<static>|Product available()
 * @method static ProductFactory factory($count = null, $state = [])
 * @method static Builder<static>|Product newModelQuery()
 * @method static Builder<static>|Product newQuery()
 * @method static Builder<static>|Product query()
 * @method static Builder<static>|Product whereAvailableFrom($value)
 * @method static Builder<static>|Product whereAvailableUntil($value)
 * @method static Builder<static>|Product whereBrandId($value)
 * @method static Builder<static>|Product whereCategoryId($value)
 * @method static Builder<static>|Product whereCreatedAt($value)
 * @method static Builder<static>|Product whereDescription($value)
 * @method static Builder<static>|Product whereId($value)
 * @method static Builder<static>|Product whereIsActive($value)
 * @method static Builder<static>|Product whereIsFeatured($value)
 * @method static Builder<static>|Product whereIsSaleable($value)
 * @method static Builder<static>|Product whereIsSearchPromoted($value)
 * @method static Builder<static>|Product whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Product whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static Builder<static>|Product whereLocale(string $column, string $locale)
 * @method static Builder<static>|Product whereLocales(string $column, array $locales)
 * @method static Builder<static>|Product whereMetaRobots($value)
 * @method static Builder<static>|Product whereName($value)
 * @method static Builder<static>|Product whereOgImage($value)
 * @method static Builder<static>|Product whereProductTypeId($value)
 * @method static Builder<static>|Product whereSeoDescription($value)
 * @method static Builder<static>|Product whereSeoTitle($value)
 * @method static Builder<static>|Product whereShortDescription($value)
 * @method static Builder<static>|Product whereSitemapExclude($value)
 * @method static Builder<static>|Product whereSkuPrefix($value)
 * @method static Builder<static>|Product whereSlug($value)
 * @method static Builder<static>|Product whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Guarded(['id'])]
#[Table(name: 'products')]
class Product extends Model implements HasMedia
{
    use HasFactory;
    use HasMetafields;
    use HasTags;
    use HasTranslations;
    use HasVersions;
    use InteractsWithMedia;
    use LogsActivity;
    use SanitizesTranslatableHtml;
    use Searchable;

    /** @var array<int, string> */
    public array $translatable = ['name', 'slug', 'description', 'short_description'];

    /** @var array<int, string> */
    protected array $htmlAttributes = ['description', 'short_description'];

    /** @var array<int, string> */
    protected array $versionedAttributes = [
        'name', 'slug', 'description', 'short_description',
        'is_active', 'is_saleable', 'brand_id',
    ];

    protected int $maxVersions = 50;

    protected $casts = [
        'is_active' => 'boolean',
        'is_saleable' => 'boolean',
        'is_search_promoted' => 'boolean',
        'is_featured' => 'boolean',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
        'sitemap_exclude' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'slug', 'is_active', 'is_saleable'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('product');
    }

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_product');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function flags(): BelongsToMany
    {
        return $this->belongsToMany(ProductFlag::class, 'product_flag_product')
            ->withTimestamps()
            ->orderBy('position');
    }

    public function promotions(): BelongsToMany
    {
        return $this->belongsToMany(Promotion::class, 'promotion_products')
            ->withPivot('discount_value', 'discount_type')
            ->withTimestamps();
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('position');
    }

    public function activeVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true)->orderBy('position');
    }

    public function defaultVariant(): HasOne
    {
        return $this->hasOne(ProductVariant::class)->where('is_default', true);
    }

    public function getDefaultVariant(): ?ProductVariant
    {
        return $this->defaultVariant()->first();
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    public function thumbnail(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_thumbnail', true)->orderBy('position');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    /**
     * Average rating (1-5)
     */
    public function averageRating(): float
    {
        return (float) ($this->reviews()
            ->where('status', ReviewStatusEnum::Approved->value)
            ->avg('rating') ?? 0);
    }

    /**
     * Price range from active variants (in cents)
     */
    public function priceRange(): array
    {
        $prices = $this->activeVariants()->pluck('price');

        return [
            'min' => $prices->min() ?? 0,
            'max' => $prices->max() ?? 0,
        ];
    }

    /**
     * Typesense collection schema. Overrides config/scout.php to ensure
     * facet fields are set correctly regardless of config caching.
     */
    public function typesenseCollectionSchema(): array
    {
        return [
            'name' => $this->searchableAs(),
            'fields' => [
                ['name' => 'id', 'type' => 'string'],
                ['name' => 'name', 'type' => 'string'],
                ['name' => 'description', 'type' => 'string', 'optional' => true],
                ['name' => 'short_description', 'type' => 'string', 'optional' => true],
                ['name' => 'sku', 'type' => 'string', 'optional' => true],
                ['name' => 'price', 'type' => 'int64'],
                ['name' => 'category_id', 'type' => 'string', 'facet' => true],
                ['name' => 'category_name', 'type' => 'string', 'optional' => true],
                ['name' => 'brand_id', 'type' => 'string', 'optional' => true, 'facet' => true],
                ['name' => 'brand_name', 'type' => 'string', 'optional' => true],
                ['name' => 'is_active', 'type' => 'bool'],
                ['name' => 'is_featured', 'type' => 'bool'],
                ['name' => 'is_search_promoted', 'type' => 'bool', 'optional' => true],
                ['name' => 'slug', 'type' => 'string', 'optional' => true],
                ['name' => 'created_at', 'type' => 'int64'],
                ['name' => 'thumbnail', 'type' => 'string', 'optional' => true],
            ],
            'default_sorting_field' => 'created_at',
        ];
    }

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        $priceRange = $this->priceRange();
        $this->loadMissing(['category', 'brand', 'media']);

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => strip_tags($this->description ?? ''),
            'short_description' => strip_tags($this->short_description ?? ''),
            'sku' => $this->variants->first()?->sku,
            'price' => (int) ($priceRange['min'] ?? 0),
            'category_id' => (string) $this->category_id,
            'category_name' => $this->category?->name,
            'brand_id' => $this->brand_id ? (string) $this->brand_id : null,
            'brand_name' => $this->brand?->name,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured ?? false,
            'is_search_promoted' => $this->is_search_promoted ?? false,
            'created_at' => $this->created_at?->timestamp,
            'thumbnail' => $this->getFirstMediaUrl('images', 'thumb') ?: null,
        ];
    }

    public function shouldBeSearchable(): bool
    {
        return $this->is_active
            && (bool) Setting::get('search', 'index_products', true);
    }

    public function searchableAs(): string
    {
        return 'products';
    }

    /**
     * Scope: active and available products
     */
    #[Scope]
    protected function available(Builder $query): Builder
    {
        $now = now();

        return $query
            ->where('is_active', true)
            ->where('is_saleable', true)
            ->where(function (Builder $q) use ($now): void {
                $q->whereNull('available_from')->orWhere('available_from', '<=', $now);
            })
            ->where(function (Builder $q) use ($now): void {
                $q->whereNull('available_until')->orWhere('available_until', '>=', $now);
            });
    }
}
