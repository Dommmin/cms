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
 * @property int $product_variant_id
 * @property string $name
 * @property string $file_path
 * @property string $file_name
 * @property int $file_size
 * @property string|null $mime_type
 * @property int $position
 * @property-read ProductVariant $variant
 * @property-read Media|null $media
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload whereMimeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload whereProductVariantId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductDownload whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'product_variant_id',
    'name',
    'file_path',
    'file_name',
    'file_size',
    'mime_type',
    'position',
])]
#[Table(name: 'product_downloads')]
class ProductDownload extends Model
{
    use HasFactory;

    protected $casts = [
        'file_size' => 'integer',
        'position' => 'integer',
    ];

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'file_path', 'id');
    }

    public function getFormattedFileSize(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2).' '.$units[$i];
    }

    public function getUrl(): string
    {
        if (str_starts_with($this->file_path, 'http')) {
            return $this->file_path;
        }

        return route('api.v1.downloads.show', $this);
    }
}
