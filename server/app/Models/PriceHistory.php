<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_variant_id
 * @property int $price
 * @property CarbonImmutable $recorded_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductVariant $productVariant
 *
 * @method static Builder<static>|PriceHistory newModelQuery()
 * @method static Builder<static>|PriceHistory newQuery()
 * @method static Builder<static>|PriceHistory query()
 * @method static Builder<static>|PriceHistory whereCreatedAt($value)
 * @method static Builder<static>|PriceHistory whereId($value)
 * @method static Builder<static>|PriceHistory wherePrice($value)
 * @method static Builder<static>|PriceHistory whereProductVariantId($value)
 * @method static Builder<static>|PriceHistory whereRecordedAt($value)
 * @method static Builder<static>|PriceHistory whereUpdatedAt($value)
 *
 * @mixin Model
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
