<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Shared\Infrastructure\Storage\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Media Controller
 * Handles file uploads
 */
final class MediaController extends Controller
{
    public function __construct(
        private readonly MediaService $mediaService
    ) {}

    /**
     * POST /api/media/upload
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:10240',
            'type' => 'required|in:product,review,category',
        ]);

        $file = $request->file('file');
        $result = $this->mediaService->upload($file, $request->type . 's');

        return response()->json($result);
    }

    /**
     * DELETE /api/media/{path}
     */
    public function delete(string $path): JsonResponse
    {
        $this->mediaService->delete($path);

        return response()->json(['message' => 'File deleted']);
    }
}

