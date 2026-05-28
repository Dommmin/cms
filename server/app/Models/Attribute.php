<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttributeTypeEnum;
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
 * @property AttributeTypeEnum $type
 * @property string|null $unit
 * @property bool $is_filterable
 * @property bool $is_variant_selection
 * @property int $position
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductType> $productTypes
 * @property-read int|null $product_types_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttributeValue> $values
 * @property-read int|null $values_count
 * @method static \Database\Factories\AttributeFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute whereIsFilterable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute whereIsVariantSelection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attribute whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'name', 'slug', 'type', 'unit', 'is_filterable', 'is_variant_selection', 'position',
])]
#[Table(name: 'attributes')]
class Attribute extends Model
{
    use HasFactory;

    protected $casts = [
        'type' => AttributeTypeEnum::class,
        'is_filterable' => 'boolean',
        'is_variant_selection' => 'boolean',
    ];

    public function values(): HasMany
    {
        return $this->hasMany(AttributeValue::class)->orderBy('position');
    }

    public function productTypes(): BelongsToMany
    {
        return $this->belongsToMany(ProductType::class, 'product_type_attributes');
    }
}
