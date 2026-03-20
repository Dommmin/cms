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
        $locale = app()->getLocale();
        $segments = array_filter(explode('/', $slug), fn (string $s) => $s !== '');

        $page = Page::findByLocalizedPath(array_values($segments), $locale);

        abort_unless($page !== null, 404);

        $page->load([
            'sections' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
            'sections.blocks' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
            'sections.blocks.relations',
        ]);

        return response()->json(['data' => new PageResource($page)]);
    }
}
