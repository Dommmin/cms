<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Core\Domain\Models\Currency;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
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
 */
class ProductVariant extends Model
{
    use HasFactory;
    use HasTranslations;
    use LogsActivity;

    /** @var array<string> */
    public array $translatable = ['name'];

    protected $table = 'product_variants';

    protected $fillable = [
        'product_id', 'tax_rate_id', 'sku', 'barcode', 'ean', 'upc', 'name', 'price', 'cost_price',
        'compare_at_price', 'weight', 'stock_quantity', 'stock_threshold',
        'is_active', 'is_default', 'is_digital', 'download_limit', 'download_expiry_days', 'position',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'is_digital' => 'boolean',
        'download_limit' => 'integer',
        'download_expiry_days' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['sku', 'barcode', 'ean', 'upc', 'price', 'stock_quantity', 'is_active', 'is_digital'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
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
        $rate = $this->taxRate;

        if (! $rate) {
            $product = $this->product;
            if ($product && $product->category) {
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

        return $matching instanceof ProductVariantPriceTier ? $matching->price : $this->price;
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
     * Check if in stock
     */
    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
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
}
