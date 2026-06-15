<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\PageResource;
use App\Models\Page;
use App\Models\PagePreviewToken;
use App\Services\PageBuilder\PageRenderContext;
use App\Services\PageBuilder\PageRenderContextResolver;
use App\Services\PagePreviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends ApiController
{
    public function showBySystemPageKey(Request $request, string $systemPageKey): JsonResponse
    {
        $page = Page::findPublishedBySystemPageKey($systemPageKey, app()->getLocale());

        abort_unless($page instanceof Page, 404);

        $page->load([
            'metafields',
            'sections' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
            'sections.blocks' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
            'sections.blocks.relations',
        ]);

        $this->bindPageRenderContext($page, []);

        return $this->ok(new PageResource($page));
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $locale = app()->getLocale();
        $segments = array_values(array_filter(explode('/', $slug), fn (string $s): bool => $s !== ''));

        if ($request->filled('preview_token')) {
            $previewToken = resolve(PagePreviewService::class)->findValidToken(
                (string) $request->input('preview_token')
            );
            if ($previewToken instanceof PagePreviewToken) {
                $page = Page::query()->findOrFail($previewToken->page_id);
                $page->load([
                    'metafields',
                    'sections' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
                    'sections.blocks' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
                    'sections.blocks.relations',
                ]);

                $this->bindPageRenderContext($page, $segments);

                return $this->ok(new PageResource($page));
            }
        }

        $page = Page::findByLocalizedPath($segments, $locale);

        abort_unless($page instanceof Page, 404);

        $page->load([
            'metafields',
            'sections' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
            'sections.blocks' => fn ($q) => $q->where('is_active', true)->orderBy('position'),
            'sections.blocks.relations',
        ]);

        $this->bindPageRenderContext($page, $segments);

        return $this->ok(new PageResource($page));
    }

    /**
     * @param  list<string>  $segments
     */
    private function bindPageRenderContext(Page $page, array $segments): void
    {
        $context = resolve(PageRenderContextResolver::class)->resolve(
            $page,
            $segments,
            app()->getLocale(),
        );

        app()->instance(PageRenderContext::class, $context);
    }
}
