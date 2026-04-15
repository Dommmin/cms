<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

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
        // Only generate image conversions for image files
        if ($media instanceof Media && ! str_starts_with($media->mime_type ?? '', 'image/')) {
            return;
        }

        // Fast WebP thumbnail for the admin grid — generated synchronously
        $this->addMediaConversion('thumbnail')
            ->fit(Fit::Crop, 400, 400)
            ->format('webp')
            ->quality(80)
            ->nonQueued();

        // Optimised WebP for the frontend with automatic srcset
        $this->addMediaConversion('optimized')
            ->fit(Fit::Max, 1920, 1920)
            ->format('webp')
            ->quality(85)
            ->withResponsiveImages();
    }
}
