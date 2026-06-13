<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Builders\ProductVariantBuilder;
use App\Services\Hooks\Facades\Hook;
use App\Services\Hooks\Pricing\ProductPriceFilter;
use Carbon\CarbonImmutable;
use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Translatable\HasTranslations;

/**
 * Product Variant Model
 * Moved to Ecommerce module
 *
 * @property int $id
 * @property int $product_id
 * @property int|null $tax_rate_id
 * @property string $sku
 * @property string|null $barcode
 * @property string|null $ean
 * @property string|null $upc
 * @property array<string, string>|string $name
 * @property int $price
 * @property int $cost_price
 * @property int|null $compare_at_price
 * @property float|null $weight
 * @property int $stock_quantity
 * @property int $stock_threshold
 * @property string $stock_status
 * @property bool $backorder_allowed
 * @property Carbon|null $available_at
 * @property bool $is_active
 * @property bool $is_default
 * @property bool $is_digital
 * @property int|null $download_limit
 * @property int|null $download_expiry_days
 * @property int $position
 * @property-read Product|null $product
 * @property-read TaxRate|null $taxRate
 * @property-read Collection<int, VariantAttributeValue> $attributeValues
 * @property-read Collection<int, ProductImage> $images
 * @property-read Collection<int, ProductDownload> $downloads
 * @property-read Collection<int, PriceHistory> $priceHistory
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read int|null $attribute_values_count
 * @property-read int|null $downloads_count
 * @property-read array $translatable_columns_from
 * @property-read int|null $images_count
 * @property-read int|null $price_history_count
 * @property-read Collection<int, ProductVariantPriceTier> $priceTiers
 * @property-read int|null $price_tiers_count
 * @property-read mixed $translations
 *
 * @method static ProductVariantFactory factory($count = null, $state = [])
 * @method static ProductVariantBuilder<static>|ProductVariant newModelQuery()
 * @method static ProductVariantBuilder<static>|ProductVariant newQuery()
 * @method static ProductVariantBuilder<static>|ProductVariant query()
 * @method static array getActivePriceBounds()
 * @method static ProductVariantBuilder<static>|ProductVariant whereAvailableAt($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereBackorderAllowed($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereBarcode($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereCompareAtPrice($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereCostPrice($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereCreatedAt($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereDownloadExpiryDays($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereDownloadLimit($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereEan($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereId($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereIsActive($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereIsDefault($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereIsDigital($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereJsonContainsLocale(string $column, string $locale, ?mixed $value, string $operand = '=')
 * @method static ProductVariantBuilder<static>|ProductVariant whereJsonContainsLocales(string $column, array $locales, ?mixed $value, string $operand = '=')
 * @method static ProductVariantBuilder<static>|ProductVariant whereLocale(string $column, string $locale)
 * @method static ProductVariantBuilder<static>|ProductVariant whereLocales(string $column, array $locales)
 * @method static ProductVariantBuilder<static>|ProductVariant whereName($value)
 * @method static ProductVariantBuilder<static>|ProductVariant wherePosition($value)
 * @method static ProductVariantBuilder<static>|ProductVariant wherePrice($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereProductId($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereSku($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereStockQuantity($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereStockStatus($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereStockThreshold($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereTaxRateId($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereUpc($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereUpdatedAt($value)
 * @method static ProductVariantBuilder<static>|ProductVariant whereWeight($value)
 *
 * @mixin Model
 */
#[Fillable([
    'product_id', 'tax_rate_id', 'sku', 'barcode', 'ean', 'upc', 'name', 'price', 'cost_price',
    'compare_at_price', 'weight', 'stock_quantity', 'stock_threshold',
    'stock_status', 'backorder_allowed', 'available_at',
    'is_active', 'is_default', 'is_digital', 'download_limit', 'download_expiry_days', 'position',
])]
#[Table(name: 'product_variants')]
class ProductVariant extends Model
{
    use HasFactory;
    use HasTranslations;
    use LogsActivity;

    /** @var array<string> */
    public array $translatable = ['name'];

    /**
     * Create a new Eloquent query builder for the model.
     *
     * @param  Builder  $query
     * @return ProductVariantBuilder<static>
     */
    public function newEloquentBuilder($query): ProductVariantBuilder
    {
        /** @var ProductVariantBuilder<static> */
        $builder = new ProductVariantBuilder($query);

        return $builder;
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['sku', 'barcode', 'ean', 'upc', 'price', 'stock_quantity', 'is_active', 'is_digital', 'stock_status', 'backorder_allowed'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('product_variant');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function taxRate(): BelongsTo
    {
        return $this->belongsTo(TaxRate::class);
    }

    /**
     * Get tax rate - from variant or from product category
     */
    public function effectiveTaxRate(): ?TaxRate
    {
        $this->loadMissing(['taxRate', 'product.category.taxRate']);

        $rate = $this->taxRate;

        if (! $rate) {
            $product = $this->product;
            if ($product) {
                $rate = $product->category->taxRate;
            }
        }

        return $rate instanceof TaxRate ? $rate : TaxRate::default();
    }

    public function attributeValues(): HasMany
    {
        return $this->hasMany(VariantAttributeValue::class, 'variant_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function downloads(): HasMany
    {
        return $this->hasMany(ProductDownload::class, 'product_variant_id');
    }

    public function priceTiers(): HasMany
    {
        return $this->hasMany(ProductVariantPriceTier::class)->orderBy('min_quantity');
    }

    /**
     * Get the unit price for a given quantity, checking tiers first.
     * Falls back to the base price when no matching tier exists.
     */
    public function getPriceForQuantity(int $quantity): int
    {
        $tiers = $this->relationLoaded('priceTiers')
            ? $this->priceTiers
            : $this->priceTiers()->get();

        $matching = $tiers
            ->filter(fn (ProductVariantPriceTier $t): bool => $t->min_quantity <= $quantity && ($t->max_quantity === null || $t->max_quantity >= $quantity))
            ->sortByDesc('min_quantity')
            ->first();

        $price = $matching instanceof ProductVariantPriceTier ? $matching->price : $this->price;

        $filter = Hook::filter(new ProductPriceFilter($price, $this, $quantity));

        return $filter->price;
    }

    public function priceHistory(): HasMany
    {
        return $this->hasMany(PriceHistory::class)->latest('recorded_at');
    }

    /**
     * Lowest price recorded in the last 30 days (EU Omnibus Directive).
     * Returns null when no price history exists (frontend hides the label).
     * Uses the eager-loaded relation when available to avoid N+1 queries.
     */
    public function lowestPriceInLast30Days(): ?int
    {
        $cutoff = now()->subDays(30);

        if ($this->relationLoaded('priceHistory')) {
            return $this->priceHistory
                ->filter(fn ($h): bool => $h->recorded_at >= $cutoff)
                ->min('price');
        }

        return $this->priceHistory()
            ->where('recorded_at', '>=', $cutoff)
            ->min('price');
    }

    /**
     * Formatted price
     */
    public function formattedPrice(): string
    {
        $currency = Currency::base();

        return $currency->format($this->price);
    }

    /**
     * Check if in stock (backorder allows ordering when stock is zero)
     */
    public function isInStock(): bool
    {
        if ($this->backorder_allowed) {
            return true;
        }

        return $this->stock_quantity > 0;
    }

    /**
     * Get computed stock status label based on current state
     */
    public function getStockStatusLabel(): string
    {
        if ($this->stock_quantity > 0) {
            return 'in_stock';
        }

        if ($this->stock_status === 'pre_order') {
            return 'pre_order';
        }

        if ($this->backorder_allowed) {
            return 'backorder';
        }

        return 'out_of_stock';
    }

    /**
     * Check if stock is low
     */
    public function isLowStock(): bool
    {
        return $this->stock_quantity > 0 && $this->stock_quantity <= $this->stock_threshold;
    }

    /**
     * Margin in cents
     */
    public function margin(): int
    {
        return $this->price - $this->cost_price;
    }

    /**
     * Margin in percentage
     */
    public function marginPercent(): float
    {
        if ($this->price === 0) {
            return 0;
        }

        return round(($this->margin() / $this->price) * 100, 2);
    }

    /**
     * Check if this is a digital product
     */
    public function isDigital(): bool
    {
        return $this->is_digital;
    }

    /**
     * Check if digital product has downloadable files
     */
    public function hasDownloads(): bool
    {
        return $this->is_digital && $this->downloads()->exists();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'is_digital' => 'boolean',
            'backorder_allowed' => 'boolean',
            'available_at' => 'datetime',
            'download_limit' => 'integer',
            'download_expiry_days' => 'integer',
        ];
    }
}
