<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkDestroyMediaRequest;
use App\Http\Requests\Admin\StoreMediaRequest;
use App\Http\Requests\Admin\UpdateMediaRequest;
use App\Models\CmsMedia;
use App\Queries\Admin\MediaIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    public function index(Request $request): Response
    {
        $media = (new MediaIndexQuery($request))->execute();

        return inertia('admin/media/index', [
            'media' => $media,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $media = (new MediaIndexQuery($request))->executeForSearch();

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
            $cmsMedia = CmsMedia::create();
            $cmsMedia->addMedia($file)
                ->withCustomProperties(['alt' => '', 'caption' => '', 'description' => '', 'author' => ''])
                ->toMediaCollection($request->input('collection', 'default'));
        }

        return back()->with('success', 'File(s) uploaded');
    }

    public function update(UpdateMediaRequest $request, Media $media): RedirectResponse
    {
        $media->setCustomProperty('alt', $request->input('alt', ''));
        $media->setCustomProperty('caption', $request->input('caption', ''));
        $media->setCustomProperty('description', $request->input('description', ''));
        $media->setCustomProperty('author', $request->input('author', ''));
        $media->save();

        return back()->with('success', 'Media updated');
    }

    public function destroy(Media $media): RedirectResponse
    {
        $media->delete();

        return back()->with('success', 'File deleted');
    }

    public function upload(StoreMediaRequest $request): JsonResponse
    {
        $files = $request->file('files', []);

        if (! $request->hasFile('files') && $request->hasFile('file')) {
            $files = [$request->file('file')];
        }

        $uploaded = [];

        foreach ($files as $file) {
            $cmsMedia = CmsMedia::create();
            $media = $cmsMedia->addMedia($file)
                ->withCustomProperties(['alt' => '', 'caption' => '', 'description' => '', 'author' => ''])
                ->toMediaCollection($request->input('collection', 'default'));

            $uploaded[] = [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'url' => $media->getUrl(),
                'created_at' => $media->created_at,
            ];
        }

        return response()->json($uploaded);
    }

    public function bulkDestroy(BulkDestroyMediaRequest $request): RedirectResponse
    {
        $request->validated();

        Media::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Files deleted');
    }
}
