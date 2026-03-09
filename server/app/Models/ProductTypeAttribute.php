<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductTypeAttribute extends Model
{
    use HasFactory;

    public $timestamps = false;

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
