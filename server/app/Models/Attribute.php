<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttributeTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attribute extends Model
{
    use HasFactory;

    protected $table = 'attributes';

    protected $fillable = [
        'name', 'slug', 'type', 'unit', 'is_filterable', 'is_variant_selection', 'position',
    ];

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
