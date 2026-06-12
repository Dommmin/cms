<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\CategoryAttributeSchemaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $category_id
 * @property int $attribute_id
 * @property bool $is_required
 * @property int $position
 * @property-read Attribute $attribute
 * @property-read Category $category
 *
 * @method static CategoryAttributeSchemaFactory factory($count = null, $state = [])
 * @method static Builder<static>|CategoryAttributeSchema newModelQuery()
 * @method static Builder<static>|CategoryAttributeSchema newQuery()
 * @method static Builder<static>|CategoryAttributeSchema query()
 * @method static Builder<static>|CategoryAttributeSchema whereAttributeId($value)
 * @method static Builder<static>|CategoryAttributeSchema whereCategoryId($value)
 * @method static Builder<static>|CategoryAttributeSchema whereId($value)
 * @method static Builder<static>|CategoryAttributeSchema whereIsRequired($value)
 * @method static Builder<static>|CategoryAttributeSchema wherePosition($value)
 *
 * @mixin Model
 */
#[Fillable([
    'category_id', 'attribute_id', 'is_required', 'position',
])]
#[Table(name: 'category_attribute_schemas')]
#[WithoutTimestamps]
class CategoryAttributeSchema extends Model
{
    use HasFactory;

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
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
