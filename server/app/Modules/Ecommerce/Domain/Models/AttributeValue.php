<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AttributeValue extends Model
{
    protected $table = 'attribute_values';

    protected $fillable = [
        'attribute_id', 'value', 'slug', 'color_hex', 'position',
    ];

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    public function isColor(): bool
    {
        return $this->attribute->type === \App\Enums\AttributeType::Color;
    }
}

