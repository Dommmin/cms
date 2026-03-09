<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNewsletterSubscriberRequest;
use App\Http\Requests\Admin\UpdateNewsletterSubscriberRequest;
use App\Models\NewsletterSubscriber;
use App\Queries\Admin\NewsletterSubscriberIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class NewsletterSubscriberController extends Controller
{
    public function index(Request $request): Response
    {
        $subscriberQuery = new NewsletterSubscriberIndexQuery($request);
        $subscribers = $subscriberQuery->execute();

        return inertia('admin/newsletter/subscribers/index', [
            'subscribers' => $subscribers,
            'filters' => $request->only(['search', 'status', 'segment']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/newsletter/subscribers/create');
    }

    public function store(StoreNewsletterSubscriberRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['is_active'] = $data['is_active'] ?? true;
        $data['consent_given'] = true;
        $data['consent_given_at'] = now();
        $data['consent_source'] = 'manual';
        $data['token'] = bin2hex(random_bytes(16));

        NewsletterSubscriber::create($data);

        return redirect()->route('admin.newsletter.subscribers.index')->with('success', 'Subskrybent został dodany');
    }

    public function show(NewsletterSubscriber $subscriber): Response
    {
        $subscriber->load(['sends', 'opens', 'clicks']);

        $stats = [
            'total_sends' => $subscriber->sends()->count(),
            'total_opens' => $subscriber->opens()->count(),
            'total_clicks' => $subscriber->clicks()->count(),
        ];

        return inertia('admin/newsletter/subscribers/show', [
            'subscriber' => $subscriber,
            'stats' => $stats,
        ]);
    }

    public function edit(NewsletterSubscriber $subscriber): Response
    {
        return inertia('admin/newsletter/subscribers/edit', [
            'subscriber' => $subscriber,
        ]);
    }

    public function update(UpdateNewsletterSubscriberRequest $request, NewsletterSubscriber $subscriber): RedirectResponse
    {
        $data = $request->validated();

        $subscriber->update($data);

        return redirect()->back()->with('success', 'Subskrybent został zaktualizowany');
    }

    public function destroy(NewsletterSubscriber $subscriber): RedirectResponse
    {
        $subscriber->delete();

        return redirect()->back()->with('success', 'Subskrybent został usunięty');
    }

    public function bulkActivate(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);

        NewsletterSubscriber::whereIn('id', $ids)->update(['is_active' => true]);

        return redirect()->back()->with('success', 'Zaznaczeni subskrybenci zostali aktywowani');
    }

    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);

        NewsletterSubscriber::whereIn('id', $ids)->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Zaznaczeni subskrybenci zostali dezaktywowani');
    }

    public function bulkDelete(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);

        NewsletterSubscriber::whereIn('id', $ids)->delete();

        return redirect()->back()->with('success', 'Zaznaczeni subskrybenci zostali usunięci');
    }
}
