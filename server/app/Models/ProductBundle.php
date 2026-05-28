<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
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
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read int|null $items_count
 * @property-read \App\Models\Product $product
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle whereDiscountPercentage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBundle whereUpdatedAt($value)
 * @mixin \Eloquent
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

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function items(): BelongsToMany
    {
        return $this->belongsToMany(ProductVariant::class, 'product_bundle_items')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function calculateBundlePrice(): int
    {
        $total = $this->items->sum(fn ($variant): int|float => $variant->price * $variant->pivot->quantity);

        if ($this->discount_percentage > 0) {
            return (int) ($total * (100 - $this->discount_percentage) / 100);
        }

        return $total;
    }
}
