<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Image\Enums\Fit;
use Spatie\Image\Image;

/**
 * Media Service
 * Handles file uploads with Cloudinary or local storage
 */
class MediaService
{
    /**
     * Upload a file
     */
    public function upload(UploadedFile $file, string $folder = 'media'): array
    {
        $disk = config('filesystems.media', 'public');

        if ($disk === 'cloudinary') {
            return $this->uploadToCloudinary($file, $folder);
        }

        return $this->uploadLocal($file, $folder);
    }

    /**
     * Delete a file
     */
    public function delete(string $path): bool
    {
        $disk = config('filesystems.media', 'public');

        return Storage::disk($disk)->delete($path);
    }

    /**
     * Upload to Cloudinary
     */
    private function uploadToCloudinary(UploadedFile $file, string $folder): array
    {
        $path = $file->store($folder, 'cloudinary');

        // Cloudinary automatically generates variants
        return [
            'path' => $path,
            'url' => Storage::disk('cloudinary')->url($path),
            'variants' => [
                'thumbnail' => Storage::disk('cloudinary')->url($path, ['width' => 300, 'height' => 300]),
                'medium' => Storage::disk('cloudinary')->url($path, ['width' => 800, 'height' => 800]),
                'large' => Storage::disk('cloudinary')->url($path, ['width' => 1200, 'height' => 1200]),
            ],
        ];
    }

    /**
     * Upload to local storage
     */
    private function uploadLocal(UploadedFile $file, string $folder): array
    {
        $path = $file->store($folder, 'public');

        $mimeType = $file->getMimeType() ?? '';

        if (str_starts_with($mimeType, 'image/')) {
            $variants = $this->generateLocalImageVariants((string) $path, $folder);
        } else {
            $url = Storage::url($path);
            $variants = [
                'thumbnail' => $url,
                'medium' => $url,
                'large' => $url,
            ];
        }

        return [
            'path' => $path,
            'url' => Storage::url($path),
            'variants' => $variants,
        ];
    }

    /**
     * Generate resized variants of a stored image using spatie/image.
     *
     * Uses Fit::Max which preserves aspect ratio and never upscales.
     *
     * @return array{thumbnail: string, medium: string, large: string}
     */
    private function generateLocalImageVariants(string $storedPath, string $folder): array
    {
        $absolutePath = Storage::disk('public')->path($storedPath);

        $pathInfo = pathinfo($storedPath);
        $basename = $pathInfo['filename'];
        $ext = $pathInfo['extension'] ?? 'jpg';

        $variantSizes = [
            'thumbnail' => [300, 300],
            'medium' => [800, 800],
            'large' => [1200, 1200],
        ];

        $variants = [];

        foreach ($variantSizes as $name => [$width, $height]) {
            $variantFilename = sprintf('%s/%s_%s.%s', $folder, $basename, $name, $ext);
            $variantPath = Storage::disk('public')->path($variantFilename);

            Image::load($absolutePath)
                ->fit(Fit::Max, $width, $height)
                ->save($variantPath);

            $variants[$name] = Storage::url($variantFilename);
        }

        /** @var array{thumbnail: string, medium: string, large: string} $variants */
        return $variants;
    }
}
