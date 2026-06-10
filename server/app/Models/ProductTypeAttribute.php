<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_type_id
 * @property int $attribute_id
 * @property bool $is_required
 * @property int $position
 * @property-read Attribute $attribute
 * @property-read ProductType $productType
 *
 * @method static Builder<static>|ProductTypeAttribute newModelQuery()
 * @method static Builder<static>|ProductTypeAttribute newQuery()
 * @method static Builder<static>|ProductTypeAttribute query()
 * @method static Builder<static>|ProductTypeAttribute whereAttributeId($value)
 * @method static Builder<static>|ProductTypeAttribute whereId($value)
 * @method static Builder<static>|ProductTypeAttribute whereIsRequired($value)
 * @method static Builder<static>|ProductTypeAttribute wherePosition($value)
 * @method static Builder<static>|ProductTypeAttribute whereProductTypeId($value)
 *
 * @mixin Model
 */
#[Fillable([
    'product_type_id', 'attribute_id', 'is_required', 'position',
])]
#[Table(name: 'product_type_attributes')]
#[WithoutTimestamps]
class ProductTypeAttribute extends Model
{
    use HasFactory;

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class);
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
        ];
    }
}
