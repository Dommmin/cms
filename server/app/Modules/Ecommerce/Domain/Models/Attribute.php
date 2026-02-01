<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Enums\AttributeType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Attribute extends Model
{
    protected $table = 'attributes';

    protected $fillable = [
        'name', 'slug', 'type', 'unit', 'is_filterable', 'is_variant_selection', 'position',
    ];

    protected $casts = [
        'type'                 => AttributeType::class,
        'is_filterable'        => 'boolean',
        'is_variant_selection' => 'boolean',
    ];

    public function values(): HasMany
    {
        return $this->hasMany(AttributeValue::class)->orderBy('position');
    }

    public function productTypes(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(ProductType::class, 'product_type_attributes');
    }
}

