<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property int $id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read MediaCollection<int, Media> $media
 * @property-read int|null $media_count
 *
 * @method static Builder<static>|CmsMedia newModelQuery()
 * @method static Builder<static>|CmsMedia newQuery()
 * @method static Builder<static>|CmsMedia query()
 * @method static Builder<static>|CmsMedia whereCreatedAt($value)
 * @method static Builder<static>|CmsMedia whereId($value)
 * @method static Builder<static>|CmsMedia whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Table(name: 'cms_media')]
class CmsMedia extends Model implements HasMedia
{
    use HasFactory;
    use InteractsWithMedia;

    protected $fillable = [];

    public function registerMediaCollections(): void
    {
        // Universal DAM collection — accepts all file types (images, PDFs, documents, video, etc.)
        $this->addMediaCollection('default');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        if (config('media-library.skip_seed_conversions', false)) {
            return;
        }

        // Only generate image conversions for image files
        if ($media instanceof Media && ! str_starts_with($media->mime_type ?? '', 'image/')) {
            return;
        }

        // Fast WebP thumbnail for the admin grid — generated synchronously
        $this->addMediaConversion('thumbnail')
            ->nonQueued()
            ->fit(Fit::Crop, 400, 400)
            ->format('webp')
            ->quality(80);

        // Optimised WebP for the frontend with automatic srcset
        $this->addMediaConversion('optimized')
            ->withResponsiveImages()
            ->fit(Fit::Max, 1920, 1920)
            ->format('webp')
            ->quality(85);
    }
}
