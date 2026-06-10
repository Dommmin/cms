<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
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
 * @property int|null $product_variant_id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Product $product
 * @property-read ProductVariant|null $variant
 *
 * @method static Builder<static>|ProductImage newModelQuery()
 * @method static Builder<static>|ProductImage newQuery()
 * @method static Builder<static>|ProductImage query()
 * @method static Builder<static>|ProductImage whereCreatedAt($value)
 * @method static Builder<static>|ProductImage whereId($value)
 * @method static Builder<static>|ProductImage whereIsThumbnail($value)
 * @method static Builder<static>|ProductImage whereMediaId($value)
 * @method static Builder<static>|ProductImage wherePosition($value)
 * @method static Builder<static>|ProductImage whereProductId($value)
 * @method static Builder<static>|ProductImage whereProductVariantId($value)
 * @method static Builder<static>|ProductImage whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'product_id', 'variant_id', 'media_id', 'is_thumbnail', 'position',
])]
#[Table(name: 'product_images')]
class ProductImage extends Model
{
    use HasFactory;

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

    protected function path(): Attribute
    {
        return Attribute::make(get: fn () => $this->media?->getUrl() ?? '');
    }

    protected function casts(): array
    {
        return [
            'is_thumbnail' => 'boolean',
        ];
    }
}
