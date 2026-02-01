<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Modules\Ecommerce\Domain\Models\Category;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

/**
 * Product Model
 * Moved to Ecommerce module
 */
final class Product extends Model
{
    use HasFactory;
    use Searchable;

    protected $table = 'products';

    protected $fillable = [
        'product_type_id', 'category_id', 'brand_id', 'name', 'slug',
        'description', 'short_description', 'sku_prefix',
        'is_active', 'is_saleable', 'available_from', 'available_until',
        'seo_title', 'seo_description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_saleable' => 'boolean',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
    ];

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('position');
    }

    public function activeVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true)->orderBy('position');
    }

    public function defaultVariant(): ?ProductVariant
    {
        return $this->variants()->where('is_default', true)->first();
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    public function thumbnail(): ?ProductImage
    {
        return $this->images()->where('is_thumbnail', true)->first();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(\App\Modules\Reviews\Domain\Models\ProductReview::class);
    }

    /**
     * Average rating (1-5)
     */
    public function averageRating(): float
    {
        return (float) $this->reviews()
            ->where('status', \App\Enums\ReviewStatus::Approved->value)
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
     * Scope: active and available products
     */
    public static function scopeAvailable(Builder $query): Builder
    {
        $now = now();

        return $query
            ->where('is_active', true)
            ->where('is_saleable', true)
            ->where(function (Builder $q) use ($now) {
                $q->whereNull('available_from')->orWhere('available_from', '<=', $now);
            })
            ->where(function (Builder $q) use ($now) {
                $q->whereNull('available_until')->orWhere('available_until', '>=', $now);
            });
    }

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        $priceRange = $this->priceRange();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => strip_tags($this->description ?? ''),
            'short_description' => strip_tags($this->short_description ?? ''),
            'category' => $this->category->name ?? null,
            'category_id' => $this->category_id,
            'brand' => $this->brand?->name,
            'brand_id' => $this->brand_id,
            'price_min' => $priceRange['min'],
            'price_max' => $priceRange['max'],
            'is_active' => $this->is_active,
            'is_saleable' => $this->is_saleable,
            'average_rating' => $this->averageRating(),
            'created_at' => $this->created_at?->timestamp,
        ];
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'products';
    }
}

