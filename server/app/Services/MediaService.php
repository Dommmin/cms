<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

        // TODO: Process image sizes locally with Intervention Image
        // $processor = app(ImageProcessor::class);
        // $sizes = $processor->process(...);

        return [
            'path' => $path,
            'url' => Storage::url($path),
            'variants' => [
                'thumbnail' => Storage::url($path),
                'medium' => Storage::url($path),
                'large' => Storage::url($path),
            ],
        ];
    }
}
