<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CmsMedia;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Adds block uploads to the CMS media bucket and returns media_id for storage in block configuration.
 */
class BlockMediaService
{
    private const BUCKET_ID = 1;

    private const COLLECTION_IMAGES = 'block-images';

    private const COLLECTION_FILES = 'block-files';

    /**
     * Add a file from storage path (e.g. from Filament FileUpload) to the bucket and return media id.
     * Path is relative to the public disk.
     */
    public function addFromPath(string $path, string $collection = self::COLLECTION_IMAGES): int
    {
        $bucket = $this->bucket();
        $fullPath = Storage::disk('public')->path($path);

        if (! is_file($fullPath)) {
            throw new InvalidArgumentException("File not found: {$path}");
        }

        $media = $bucket->addMedia($fullPath)->toMediaCollection($collection);

        return (int) $media->getKey();
    }

    /**
     * Return public URL for a media id (for form preview). Returns null if media not found.
     */
    public function urlFor(int $mediaId): ?string
    {
        $media = Media::find($mediaId);

        return $media?->getUrl() ?? null;
    }

    public function bucket(): CmsMedia
    {
        $bucket = CmsMedia::find(self::BUCKET_ID);
        if (! $bucket) {
            throw new RuntimeException('CMS media bucket (CmsMedia id=1) does not exist. Run CmsMediaSeeder.');
        }

        return $bucket;
    }

    public function collectionForImages(): string
    {
        return self::COLLECTION_IMAGES;
    }

    public function collectionForFiles(): string
    {
        return self::COLLECTION_FILES;
    }
}
