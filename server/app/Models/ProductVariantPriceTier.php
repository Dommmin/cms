<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_variant_id
 * @property int $min_quantity
 * @property int|null $max_quantity
 * @property int $price
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ProductVariant $variant
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductVariantPriceTier newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductVariantPriceTier newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductVariantPriceTier query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductVariantPriceTier whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductVariantPriceTier whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductVariantPriceTier whereMaxQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductVariantPriceTier whereMinQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductVariantPriceTier wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductVariantPriceTier whereProductVariantId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductVariantPriceTier whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable(['product_variant_id', 'min_quantity', 'max_quantity', 'price'])]
#[Table(name: 'product_variant_price_tiers')]
class ProductVariantPriceTier extends Model
{
    use HasFactory;

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    protected function casts(): array
    {
        return [
            'min_quantity' => 'integer',
            'max_quantity' => 'integer',
            'price' => 'integer',
        ];
    }
}
