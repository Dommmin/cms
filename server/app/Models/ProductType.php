<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\ProductTypeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property bool $has_variants
 * @property array<array-key, mixed>|null $variant_selection_attributes
 * @property bool $is_shippable
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Attribute> $attributes
 * @property-read int|null $attributes_count
 * @property-read Collection<int, ProductTypeAttribute> $productTypeAttributes
 * @property-read int|null $product_type_attributes_count
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 *
 * @method static ProductTypeFactory factory($count = null, $state = [])
 * @method static Builder<static>|ProductType newModelQuery()
 * @method static Builder<static>|ProductType newQuery()
 * @method static Builder<static>|ProductType query()
 * @method static Builder<static>|ProductType whereCreatedAt($value)
 * @method static Builder<static>|ProductType whereHasVariants($value)
 * @method static Builder<static>|ProductType whereId($value)
 * @method static Builder<static>|ProductType whereIsShippable($value)
 * @method static Builder<static>|ProductType whereName($value)
 * @method static Builder<static>|ProductType whereSlug($value)
 * @method static Builder<static>|ProductType whereUpdatedAt($value)
 * @method static Builder<static>|ProductType whereVariantSelectionAttributes($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name', 'slug', 'has_variants', 'variant_selection_attributes', 'is_shippable',
])]
#[Table(name: 'product_types')]
class ProductType extends Model
{
    use HasFactory;

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function productTypeAttributes(): HasMany
    {
        return $this->hasMany(ProductTypeAttribute::class)->orderBy('position');
    }

    /** Attributy linked do tego product type */
    public function attributes(): BelongsToMany
    {
        return $this->belongsToMany(Attribute::class, 'product_type_attributes');
    }

    protected function casts(): array
    {
        return [
            'has_variants' => 'boolean',
            'variant_selection_attributes' => 'array',
            'is_shippable' => 'boolean',
        ];
    }
}
