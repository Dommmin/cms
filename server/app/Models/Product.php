<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetafields;
use App\Concerns\HasTags;
use App\Concerns\HasVersions;
use App\Enums\ReviewStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Scout\Searchable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Translatable\HasTranslations;

/**
 * @property bool $is_search_promoted
 * @property bool $is_active
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
    use Searchable;

    /** @var array<int, string> */
    public array $translatable = ['name', 'description', 'short_description'];

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
        return (float) $this->reviews()
            ->where('status', ReviewStatusEnum::Approved->value)
            ->avg('rating') ?? 0;
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

    /**
     * Get the name of the index associated with the model.
     */
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
