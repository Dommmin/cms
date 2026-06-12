<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttributeTypeEnum;
use Database\Factories\ProductAttributeValueFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property int $attribute_id
 * @property int|null $attribute_value_id
 * @property string|null $value_text
 * @property string|null $value_numeric
 * @property bool|null $value_boolean
 * @property Carbon|null $value_date
 * @property array<int, int>|null $value_json
 * @property-read Attribute $attribute
 * @property-read AttributeValue|null $selectedOption
 * @property-read Product $product
 *
 * @method static ProductAttributeValueFactory factory($count = null, $state = [])
 * @method static Builder<static>|ProductAttributeValue newModelQuery()
 * @method static Builder<static>|ProductAttributeValue newQuery()
 * @method static Builder<static>|ProductAttributeValue query()
 * @method static Builder<static>|ProductAttributeValue whereAttributeId($value)
 * @method static Builder<static>|ProductAttributeValue whereAttributeValueId($value)
 * @method static Builder<static>|ProductAttributeValue whereId($value)
 * @method static Builder<static>|ProductAttributeValue whereProductId($value)
 * @method static Builder<static>|ProductAttributeValue whereValueBoolean($value)
 * @method static Builder<static>|ProductAttributeValue whereValueDate($value)
 * @method static Builder<static>|ProductAttributeValue whereValueJson($value)
 * @method static Builder<static>|ProductAttributeValue whereValueNumeric($value)
 * @method static Builder<static>|ProductAttributeValue whereValueText($value)
 *
 * @mixin Model
 */
#[Fillable([
    'product_id',
    'attribute_id',
    'attribute_value_id',
    'value_text',
    'value_numeric',
    'value_boolean',
    'value_date',
    'value_json',
])]
#[Table(name: 'product_attribute_values')]
class ProductAttributeValue extends Model
{
    use HasFactory;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(AttributeValue::class, 'attribute_value_id');
    }

    public function hasMeaningfulValue(): bool
    {
        return match ($this->attribute->type) {
            AttributeTypeEnum::TEXT,
            AttributeTypeEnum::COLOR => $this->value_text !== null && $this->value_text !== '',
            AttributeTypeEnum::NUMERIC => $this->value_numeric !== null,
            AttributeTypeEnum::BOOLEAN => $this->value_boolean !== null,
            AttributeTypeEnum::DATE => $this->value_date !== null,
            AttributeTypeEnum::SELECT => $this->attribute_value_id !== null,
            AttributeTypeEnum::MULTISELECT => is_array($this->value_json) && $this->value_json !== [],
        };
    }

    protected function casts(): array
    {
        return [
            'value_boolean' => 'boolean',
            'value_date' => 'date',
            'value_json' => 'array',
        ];
    }
}
