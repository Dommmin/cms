<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ProductTypeAttribute extends Model
{
    protected $table = 'product_type_attributes';

    protected $fillable = [
        'product_type_id', 'attribute_id', 'is_required', 'position',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class);
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }
}

