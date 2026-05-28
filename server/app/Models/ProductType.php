<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
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
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Attribute> $attributes
 * @property-read int|null $attributes_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductTypeAttribute> $productTypeAttributes
 * @property-read int|null $product_type_attributes_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read int|null $products_count
 * @method static \Database\Factories\ProductTypeFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereHasVariants($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereIsShippable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereVariantSelectionAttributes($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'name', 'slug', 'has_variants', 'variant_selection_attributes', 'is_shippable',
])]
#[Table(name: 'product_types')]
class ProductType extends Model
{
    use HasFactory;

    protected $casts = [
        'has_variants' => 'boolean',
        'variant_selection_attributes' => 'array',
        'is_shippable' => 'boolean',
    ];

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
}
