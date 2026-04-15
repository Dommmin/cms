<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttributeTypeEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'attribute_id', 'value', 'slug', 'color_hex', 'position',
])]
#[Table(name: 'attribute_values')]
class AttributeValue extends Model
{
    use HasFactory;

    public $timestamps = false;

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    public function isColor(): bool
    {
        return $this->attribute->type === AttributeTypeEnum::COLOR;
    }
}
