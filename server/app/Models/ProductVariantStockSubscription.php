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
 * @property string $email
 * @property CarbonImmutable|null $notified_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductVariant $variant
 *
 * @method static Builder<static>|ProductVariantStockSubscription newModelQuery()
 * @method static Builder<static>|ProductVariantStockSubscription newQuery()
 * @method static Builder<static>|ProductVariantStockSubscription query()
 * @method static Builder<static>|ProductVariantStockSubscription whereCreatedAt($value)
 * @method static Builder<static>|ProductVariantStockSubscription whereId($value)
 * @method static Builder<static>|ProductVariantStockSubscription whereEmail($value)
 * @method static Builder<static>|ProductVariantStockSubscription whereProductVariantId($value)
 * @method static Builder<static>|ProductVariantStockSubscription whereNotifiedAt($value)
 * @method static Builder<static>|ProductVariantStockSubscription whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'product_variant_id',
    'email',
    'notified_at',
])]
#[Table(name: 'product_variant_stock_subscriptions')]
class ProductVariantStockSubscription extends Model
{
    use HasFactory;

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    protected function casts(): array
    {
        return [
            'notified_at' => 'datetime',
        ];
    }
}
