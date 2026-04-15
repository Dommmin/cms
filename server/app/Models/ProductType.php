<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
