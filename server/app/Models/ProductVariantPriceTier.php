<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariantPriceTier extends Model
{
    use HasFactory;

    protected $table = 'product_variant_price_tiers';

    protected $fillable = ['product_variant_id', 'min_quantity', 'max_quantity', 'price'];

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    protected function casts(): array
    {
        return [
            'min_quantity' => 'integer',
            'max_quantity' => 'integer',
            'price' => 'integer',
        ];
    }
}
