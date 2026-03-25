<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderFaqRequest;
use App\Http\Requests\Admin\StoreFaqRequest;
use App\Http\Requests\Admin\UpdateFaqRequest;
use App\Models\Faq;
use App\Queries\Admin\FaqIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class FaqController extends Controller
{
    public function index(Request $request): Response
    {
        $faqQuery = new FaqIndexQuery;
        $faqs = $faqQuery->paginate($request->only(['search', 'category', 'is_active', 'per_page']));
        $categories = $faqQuery->categories();

        return inertia('admin/faqs/index', [
            'faqs' => $faqs,
            'filters' => $request->only(['search', 'category', 'is_active']),
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        $faqQuery = new FaqIndexQuery;
        $categories = $faqQuery->categories();

        return inertia('admin/faqs/create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreFaqRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['is_active'] ??= true;
        $data['position'] ??= 0;
        $data['views_count'] = 0;
        $data['helpful_count'] = 0;

        Faq::query()->create($data);

        return to_route('admin.faqs.index')->with('success', 'FAQ zostało utworzone');
    }

    public function edit(Faq $faq): Response
    {
        $categories = Faq::query()->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values()
            ->toArray();

        return inertia('admin/faqs/edit', [
            'faq' => $faq,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateFaqRequest $request, Faq $faq): RedirectResponse
    {
        $data = $request->validated();

        $faq->update($data);

        return back()->with('success', 'FAQ zostało zaktualizowane');
    }

    public function destroy(Faq $faq): RedirectResponse
    {
        $faq->delete();

        return back()->with('success', 'FAQ zostało usunięte');
    }

    public function toggleActive(Faq $faq): RedirectResponse
    {
        $faq->update(['is_active' => ! $faq->is_active]);

        $message = $faq->is_active ? 'FAQ zostało aktywowane' : 'FAQ zostało dezaktywowane';

        return back()->with('success', $message);
    }

    public function reorder(ReorderFaqRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            foreach ($data['items'] as $item) {
                Faq::query()->where('id', $item['id'])->update(['position' => $item['position']]);
            }
        });

        return back()->with('success', 'Kolejność została zaktualizowana');
    }
}
