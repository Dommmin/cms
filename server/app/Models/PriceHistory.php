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
 * @property int $price
 * @property \Carbon\CarbonImmutable $recorded_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ProductVariant $productVariant
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceHistory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceHistory wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceHistory whereProductVariantId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceHistory whereRecordedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PriceHistory whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'product_variant_id',
    'price',
    'recorded_at',
])]
#[Table(name: 'price_history')]
class PriceHistory extends Model
{
    use HasFactory;

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'recorded_at' => 'datetime',
        ];
    }
}
