<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Product Image Model
 * Moved to Ecommerce module
 */
class ProductImage extends Model
{
    use HasFactory;

    protected $table = 'product_images';

    protected $fillable = [
        'product_id', 'variant_id', 'media_id', 'is_thumbnail', 'position',
    ];

    protected $casts = [
        'is_thumbnail' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'media_id');
    }
}
