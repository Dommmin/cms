<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Cms\StorePageRequest;
use App\Http\Requests\Admin\Cms\UpdatePageRequest;
use App\Models\Page;
use App\Queries\Admin\PageIndexQuery;
use App\Services\PageSlugService;
use App\Services\PageVersionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(
        private readonly PageSlugService $slugService,
        private readonly PageVersionService $versionService,
    ) {}

    public function index(Request $request): Response
    {
        $pageQuery = new PageIndexQuery($request);
        $pages = $pageQuery->execute();

        return inertia('admin/cms/pages/index', [
            'pages' => $pages,
            'filters' => $request->only(['search', 'status', 'is_home']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/cms/pages/create', [
            'modules' => config('cms.modules'),
        ]);
    }

    public function store(StorePageRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (($data['page_type'] ?? null) === 'blocks') {
            $data['module_name'] = null;
            $data['module_config'] = null;
        }

        $data['is_published'] = false;

        $page = Page::query()->create($data);

        return redirect()->route('admin.cms.pages.edit', $page)->with('success', 'Page created');
    }

    public function edit(Page $page): Response
    {
        return inertia('admin/cms/pages/edit', [
            'page' => array_merge($page->toArray(), [
                'title' => $page->getTranslations('title'),
                'excerpt' => $page->getTranslations('excerpt'),
            ]),
            'modules' => config('cms.modules'),
        ]);
    }

    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        $data = $request->validated();

        if (($data['page_type'] ?? null) === 'blocks') {
            $data['module_name'] = null;
            $data['module_config'] = null;
        }

        $page->update($data);

        return back()->with('success', 'Page updated');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return back()->with('success', 'Page deleted');
    }

    public function duplicate(Page $page): RedirectResponse
    {
        $copy = $page->replicate([
            'is_published',
            'published_at',
            'published_version_id',
            'draft_version_id',
        ]);

        $copy->title = $page->title.' (Copy)';
        $copy->slug = $this->slugService->uniqueSlug($copy->title, $page->parent_id);
        $copy->is_published = false;
        $copy->published_at = null;
        $copy->published_version_id = null;
        $copy->draft_version_id = null;
        $copy->save();

        return redirect()->route('admin.cms.pages.edit', $copy)->with('success', 'Page duplicated');
    }

    public function publish(Page $page): RedirectResponse
    {
        $version = $this->versionService->saveDraft($page, Auth::id(), 'Publish');
        $this->versionService->publishVersion($page, $version);

        return back()->with('success', 'Page published');
    }

    public function unpublish(Page $page): RedirectResponse
    {
        $page->update([
            'is_published' => false,
            'published_at' => null,
            'published_version_id' => null,
        ]);

        return back()->with('success', 'Page unpublished');
    }
}
