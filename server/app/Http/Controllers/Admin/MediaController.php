<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkDestroyMediaRequest;
use App\Http\Requests\Admin\MediaCropRequest;
use App\Http\Requests\Admin\StoreMediaRequest;
use App\Http\Requests\Admin\UpdateMediaRequest;
use App\Models\CmsMedia;
use App\Queries\Admin\MediaIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Spatie\Image\Image as SpatieImage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    public function index(): Response
    {
        return inertia('admin/media/index');
    }

    public function search(Request $request): JsonResponse
    {
        $media = new MediaIndexQuery($request)->executeForSearch();

        return response()->json([
            'data' => $media->items(),
            'prev_page_url' => $media->previousPageUrl(),
            'next_page_url' => $media->nextPageUrl(),
            'current_page' => $media->currentPage(),
            'last_page' => $media->lastPage(),
            'per_page' => $media->perPage(),
            'total' => $media->total(),
        ]);
    }

    public function store(StoreMediaRequest $request): RedirectResponse
    {
        $request->validated();

        $files = $request->file('files', []);

        if (! $request->hasFile('files') && $request->hasFile('file')) {
            $files = [$request->file('file')];
        }

        foreach ($files as $file) {
            $cmsMedia = CmsMedia::query()->create();
            $cmsMedia->addMedia($file)
                ->withCustomProperties(['alt' => '', 'caption' => '', 'description' => '', 'author' => ''])
                ->toMediaCollection($request->input('collection', 'default'));
        }

        return back()->with('success', 'File(s) uploaded');
    }

    public function update(UpdateMediaRequest $request, Media $media): JsonResponse
    {
        $media->setCustomProperty('alt', $request->input('alt', ''));
        $media->setCustomProperty('caption', $request->input('caption', ''));
        $media->setCustomProperty('description', $request->input('description', ''));
        $media->setCustomProperty('author', $request->input('author', ''));
        $media->save();

        $media->setAttribute('alt', (string) $media->getCustomProperty('alt', ''));
        $media->setAttribute('caption', $media->getCustomProperty('caption'));
        $media->setAttribute('description', $media->getCustomProperty('description'));
        $media->setAttribute('credit', $media->getCustomProperty('author'));

        return response()->json([
            'id' => $media->id,
            'alt' => (string) $media->getCustomProperty('alt', ''),
            'caption' => $media->getCustomProperty('caption'),
            'description' => $media->getCustomProperty('description'),
            'credit' => $media->getCustomProperty('author'),
        ]);
    }

    public function crop(MediaCropRequest $request, Media $media): JsonResponse
    {
        $validated = $request->validated();

        $x = (float) $validated['x'];
        $y = (float) $validated['y'];
        $width = (float) $validated['width'];
        $height = (float) $validated['height'];
        $zoom = (float) ($validated['zoom'] ?? 1);
        $rotate = (int) ($validated['rotate'] ?? 0);
        $aspectRatio = $validated['aspect_ratio'] ?? 'free';
        $focalPoint = $validated['focal_point'] ?? null;

        $mediaPath = $media->getPath();
        $image = SpatieImage::load($mediaPath);

        if ($rotate !== 0) {
            $image = $image->rotate($rotate);
        }

        $sourceWidth = $image->getWidth();
        $sourceHeight = $image->getHeight();
        $cropX = max(0, min((int) round($x), $sourceWidth - 1));
        $cropY = max(0, min((int) round($y), $sourceHeight - 1));
        $cropWidth = max(1, min((int) round($width), $sourceWidth - $cropX));
        $cropHeight = max(1, min((int) round($height), $sourceHeight - $cropY));

        $image = $image->manualCrop($cropWidth, $cropHeight, $cropX, $cropY);

        $cmsMedia = CmsMedia::query()->findOrFail($media->model_id);
        $cropVariant = $aspectRatio === 'free' ? 'free' : str_replace(':', '_', $aspectRatio);
        $cropParams = [
            'x' => $cropX,
            'y' => $cropY,
            'width' => $cropWidth,
            'height' => $cropHeight,
            'rotate' => $rotate,
            'zoom' => $zoom,
            'aspect_ratio' => $aspectRatio,
            'variant' => $cropVariant,
        ];

        $tempPath = sys_get_temp_dir().'/crop_'.$media->id.'_'.time().'.jpg';
        $image->save($tempPath);

        $cmsMedia->addMedia($tempPath)
            ->withCustomProperties([
                'alt' => $media->getCustomProperty('alt', ''),
                'caption' => $media->getCustomProperty('caption', ''),
                'description' => $media->getCustomProperty('description', ''),
                'author' => $media->getCustomProperty('author', ''),
                'crop_of' => (string) $media->id,
                'crop_params' => $cropParams,
                'crop_variant' => $cropVariant,
                'width' => $cropWidth,
                'height' => $cropHeight,
            ])
            ->toMediaCollection($media->collection_name);

        if ($focalPoint) {
            $media->setCustomProperty('focal_point', $focalPoint);
            $media->save();
        }

        $newMedia = $cmsMedia->getMedia($media->collection_name)->last();

        return response()->json([
            'id' => $newMedia->id,
            'name' => $newMedia->name,
            'file_name' => $newMedia->file_name,
            'mime_type' => $newMedia->mime_type,
            'size' => $newMedia->size,
            'url' => $newMedia->getUrl(),
            'thumb_url' => $newMedia->hasGeneratedConversion('thumbnail')
                ? $newMedia->getUrl('thumbnail')
                : null,
            'width' => $cropWidth,
            'height' => $cropHeight,
            'crop_of' => $media->id,
            'crop_params' => $cropParams,
            'crop_variant' => $cropVariant,
            'focal_point' => $focalPoint,
        ]);
    }

    public function destroy(Media $media): JsonResponse
    {
        $media->delete();

        return response()->json(['success' => true]);
    }

    public function upload(StoreMediaRequest $request): JsonResponse
    {
        $files = $request->file('files', []);

        if (! $request->hasFile('files') && $request->hasFile('file')) {
            $files = [$request->file('file')];
        }

        $uploaded = [];

        foreach ($files as $file) {
            $cmsMedia = CmsMedia::query()->create();
            $media = $cmsMedia->addMedia($file)
                ->withCustomProperties(['alt' => '', 'caption' => '', 'description' => '', 'author' => ''])
                ->toMediaCollection($request->input('collection', 'default'));

            $uploaded[] = [
                'id' => (int) $media->getKey(),
                'name' => $media->name,
                'file_name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'url' => $media->getUrl(),
                'thumb_url' => $media->hasGeneratedConversion('thumbnail')
                    ? $media->getUrl('thumbnail')
                    : null,
                'thumbnail_url' => $media->hasGeneratedConversion('thumbnail')
                    ? $media->getUrl('thumbnail')
                    : null,
                'alt' => (string) $media->getCustomProperty('alt', ''),
                'caption' => $media->getCustomProperty('caption'),
                'description' => $media->getCustomProperty('description'),
                'credit' => $media->getCustomProperty('author'),
                'width' => $media->getCustomProperty('width'),
                'height' => $media->getCustomProperty('height'),
                'created_at' => $media->created_at,
            ];
        }

        return response()->json($uploaded);
    }

    public function bulkDestroy(BulkDestroyMediaRequest $request): RedirectResponse
    {
        $request->validated();

        Media::query()->whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Files deleted');
    }
}
