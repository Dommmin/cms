<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property Collection $items
 * @property int $discount_percentage
 * @property int $id
 * @property int $product_id
 * @property string $name
 * @property string|null $description
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read int|null $items_count
 * @property-read Product $product
 *
 * @method static Builder<static>|ProductBundle newModelQuery()
 * @method static Builder<static>|ProductBundle newQuery()
 * @method static Builder<static>|ProductBundle query()
 * @method static Builder<static>|ProductBundle whereCreatedAt($value)
 * @method static Builder<static>|ProductBundle whereDescription($value)
 * @method static Builder<static>|ProductBundle whereDiscountPercentage($value)
 * @method static Builder<static>|ProductBundle whereId($value)
 * @method static Builder<static>|ProductBundle whereIsActive($value)
 * @method static Builder<static>|ProductBundle whereName($value)
 * @method static Builder<static>|ProductBundle whereProductId($value)
 * @method static Builder<static>|ProductBundle whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'product_id',
    'name',
    'description',
    'discount_percentage',
    'is_active',
])]
class ProductBundle extends Model
{
    use HasFactory;

    protected $casts = [
        'discount_percentage' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsToMany<ProductVariant, $this>
     */
    public function items(): BelongsToMany
    {
        return $this->belongsToMany(ProductVariant::class, 'product_bundle_items')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function calculateBundlePrice(): int
    {
        $total = $this->items->sum(fn (ProductVariant $variant): int => (int) ($variant->price * $variant->pivot->quantity));

        if ($this->discount_percentage > 0) {
            return (int) ($total * (100 - $this->discount_percentage) / 100);
        }

        return $total;
    }
}
