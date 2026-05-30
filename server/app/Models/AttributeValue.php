<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttributeTypeEnum;
use Database\Factories\AttributeValueFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $attribute_id
 * @property string $value
 * @property string $slug
 * @property string|null $color_hex
 * @property int $position
 * @property-read Attribute $attribute
 *
 * @method static AttributeValueFactory factory($count = null, $state = [])
 * @method static Builder<static>|AttributeValue newModelQuery()
 * @method static Builder<static>|AttributeValue newQuery()
 * @method static Builder<static>|AttributeValue query()
 * @method static Builder<static>|AttributeValue whereAttributeId($value)
 * @method static Builder<static>|AttributeValue whereColorHex($value)
 * @method static Builder<static>|AttributeValue whereId($value)
 * @method static Builder<static>|AttributeValue wherePosition($value)
 * @method static Builder<static>|AttributeValue whereSlug($value)
 * @method static Builder<static>|AttributeValue whereValue($value)
 *
 * @mixin Model
 */
#[Fillable([
    'attribute_id', 'value', 'slug', 'color_hex', 'position',
])]
#[Table(name: 'attribute_values')]
#[WithoutTimestamps]
class AttributeValue extends Model
{
    use HasFactory;

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    public function isColor(): bool
    {
        return $this->attribute->type === AttributeTypeEnum::COLOR;
    }
}
