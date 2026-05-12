<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property int $id
 * @property int $product_id
 * @property ?int $variant_id
 * @property ?int $media_id
 * @property bool $is_thumbnail
 * @property int $position
 * @property ?string $alt_text
 * @property-read ?Media $media
 * @property-read string $path
 */
#[Fillable([
    'product_id', 'variant_id', 'media_id', 'is_thumbnail', 'position',
])]
#[Table(name: 'product_images')]
class ProductImage extends Model
{
    use HasFactory;

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

    protected function getPathAttribute(): string
    {
        return $this->media?->getUrl() ?? '';
    }
}
