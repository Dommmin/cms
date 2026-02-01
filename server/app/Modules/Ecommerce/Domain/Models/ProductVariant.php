<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Modules\Core\Domain\Models\Currency;
use App\Modules\Ecommerce\Domain\Models\TaxRate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Product Variant Model
 * Moved to Ecommerce module
 */
final class ProductVariant extends Model
{
    use HasFactory;

    protected $table = 'product_variants';

    protected $fillable = [
        'product_id', 'tax_rate_id', 'sku', 'name', 'price', 'cost_price',
        'compare_at_price', 'weight', 'stock_quantity', 'stock_threshold',
        'is_active', 'is_default', 'position',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

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
    public function effectiveTaxRate(): TaxRate
    {
        return $this->taxRate
            ?? $this->product->category->taxRate
            ?? TaxRate::default();
    }

    public function attributeValues(): HasMany
    {
        return $this->hasMany(VariantAttributeValue::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
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
}

