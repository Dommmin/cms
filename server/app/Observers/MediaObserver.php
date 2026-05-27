<?php

declare(strict_types=1);

namespace App\Observers;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaObserver
{
    public function created(Media $media): void
    {
        if (str_ends_with(mb_strtolower($media->file_name), '.svg') && $media->mime_type !== 'image/svg+xml') {
            $media->mime_type = 'image/svg+xml';
            $media->saveQuietly();
        }
    }
}
