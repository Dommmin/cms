<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttributeTypeEnum;
use Carbon\CarbonImmutable;
use Database\Factories\AttributeFactory;
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
 * @property AttributeTypeEnum $type
 * @property string|null $unit
 * @property bool $is_filterable
 * @property bool $is_variant_selection
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ProductType> $productTypes
 * @property-read int|null $product_types_count
 * @property-read Collection<int, AttributeValue> $values
 * @property-read int|null $values_count
 *
 * @method static AttributeFactory factory($count = null, $state = [])
 * @method static Builder<static>|Attribute newModelQuery()
 * @method static Builder<static>|Attribute newQuery()
 * @method static Builder<static>|Attribute query()
 * @method static Builder<static>|Attribute whereCreatedAt($value)
 * @method static Builder<static>|Attribute whereId($value)
 * @method static Builder<static>|Attribute whereIsFilterable($value)
 * @method static Builder<static>|Attribute whereIsVariantSelection($value)
 * @method static Builder<static>|Attribute whereName($value)
 * @method static Builder<static>|Attribute wherePosition($value)
 * @method static Builder<static>|Attribute whereSlug($value)
 * @method static Builder<static>|Attribute whereType($value)
 * @method static Builder<static>|Attribute whereUnit($value)
 * @method static Builder<static>|Attribute whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name', 'slug', 'type', 'unit', 'is_filterable', 'is_variant_selection', 'position',
])]
#[Table(name: 'attributes')]
class Attribute extends Model
{
    use HasFactory;

    public function values(): HasMany
    {
        return $this->hasMany(AttributeValue::class)->orderBy('position');
    }

    public function productTypes(): BelongsToMany
    {
        return $this->belongsToMany(ProductType::class, 'product_type_attributes');
    }

    protected function casts(): array
    {
        return [
            'type' => AttributeTypeEnum::class,
            'is_filterable' => 'boolean',
            'is_variant_selection' => 'boolean',
        ];
    }
}
