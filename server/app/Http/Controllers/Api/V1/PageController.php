<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\PageResource;
use App\Models\Page;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $page = Page::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->with([
                'sections' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
                'sections.blocks' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
            ])
            ->firstOrFail();

        return response()->json(['data' => new PageResource($page)]);
    }
}
