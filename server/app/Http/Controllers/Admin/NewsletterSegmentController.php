<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNewsletterSegmentRequest;
use App\Http\Requests\Admin\UpdateNewsletterSegmentRequest;
use App\Models\NewsletterSegment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class NewsletterSegmentController extends Controller
{
    public function index(Request $request): Response
    {
        $segments = NewsletterSegment::query()
            ->withCount('campaigns')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->has('is_active'), function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return inertia('admin/newsletter/segments/index', [
            'segments' => $segments,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/newsletter/segments/create');
    }

    public function store(StoreNewsletterSegmentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['is_active'] = $data['is_active'] ?? true;

        NewsletterSegment::create($data);

        return redirect()->route('admin.newsletter.segments.index')->with('success', 'Segment został utworzony');
    }

    public function edit(NewsletterSegment $segment): Response
    {
        $segment->load('campaigns');

        return inertia('admin/newsletter/segments/edit', [
            'segment' => $segment,
        ]);
    }

    public function update(UpdateNewsletterSegmentRequest $request, NewsletterSegment $segment): RedirectResponse
    {
        $data = $request->validated();

        $segment->update($data);

        return redirect()->back()->with('success', 'Segment został zaktualizowany');
    }

    public function destroy(NewsletterSegment $segment): RedirectResponse
    {
        if ($segment->campaigns()->exists()) {
            return redirect()->back()->with('error', 'Nie można usunąć segmentu używanego w kampaniach');
        }

        $segment->delete();

        return redirect()->back()->with('success', 'Segment został usunięty');
    }

    public function bulkActivate(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);

        NewsletterSegment::whereIn('id', $ids)->update(['is_active' => true]);

        return redirect()->back()->with('success', 'Zaznaczone segmenty zostały aktywowane');
    }

    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);

        NewsletterSegment::whereIn('id', $ids)->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Zaznaczone segmenty zostały dezaktywowane');
    }
}
