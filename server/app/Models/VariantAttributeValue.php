<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\VariantAttributeValueFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $variant_id
 * @property int $attribute_id
 * @property int $attribute_value_id
 * @property-read Attribute $attribute
 * @property-read AttributeValue $attributeValue
 * @property-read ProductVariant $variant
 *
 * @method static VariantAttributeValueFactory factory($count = null, $state = [])
 * @method static Builder<static>|VariantAttributeValue newModelQuery()
 * @method static Builder<static>|VariantAttributeValue newQuery()
 * @method static Builder<static>|VariantAttributeValue query()
 * @method static Builder<static>|VariantAttributeValue whereAttributeId($value)
 * @method static Builder<static>|VariantAttributeValue whereAttributeValueId($value)
 * @method static Builder<static>|VariantAttributeValue whereId($value)
 * @method static Builder<static>|VariantAttributeValue whereVariantId($value)
 *
 * @mixin Model
 */
#[Fillable([
    'variant_id', 'attribute_id', 'attribute_value_id',
])]
#[Table(name: 'variant_attribute_values')]
#[WithoutTimestamps]
class VariantAttributeValue extends Model
{
    use HasFactory;

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    public function attributeValue(): BelongsTo
    {
        return $this->belongsTo(AttributeValue::class);
    }
}
