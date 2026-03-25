<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\CampaignStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ScheduleNewsletterCampaignRequest;
use App\Http\Requests\Admin\StoreNewsletterCampaignRequest;
use App\Http\Requests\Admin\UpdateNewsletterCampaignRequest;
use App\Models\NewsletterCampaign;
use App\Queries\Admin\NewsletterCampaignIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class NewsletterCampaignController extends Controller
{
    public function index(Request $request): Response
    {
        $query = new NewsletterCampaignIndexQuery($request);
        $campaigns = $query->execute();

        return inertia('admin/newsletter/campaigns/index', [
            'campaigns' => $campaigns,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    public function create(): Response
    {
        $segments = new NewsletterCampaignIndexQuery(request())->getActiveSegments();

        return inertia('admin/newsletter/campaigns/create', [
            'segments' => $segments,
        ]);
    }

    public function store(StoreNewsletterCampaignRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['status'] = CampaignStatusEnum::Draft->value;

        $campaign = NewsletterCampaign::query()->create($data);

        return to_route('admin.newsletter.campaigns.edit', $campaign)->with('success', 'Kampania została utworzona');
    }

    public function show(NewsletterCampaign $campaign): Response
    {
        $campaign->load(['segment', 'sends', 'opens', 'clicks']);

        $stats = [
            'open_rate' => $campaign->openRate(),
            'click_rate' => $campaign->clickRate(),
            'total_sent' => $campaign->total_sent,
            'total_delivered' => $campaign->total_delivered,
            'total_bounced' => $campaign->total_bounced,
            'total_unsubscribed' => $campaign->total_unsubscribed,
        ];

        return inertia('admin/newsletter/campaigns/show', [
            'campaign' => $campaign,
            'stats' => $stats,
        ]);
    }

    public function edit(NewsletterCampaign $campaign): Response
    {
        $campaign->load('segment');
        $segments = new NewsletterCampaignIndexQuery(request())->getActiveSegments();

        return inertia('admin/newsletter/campaigns/edit', [
            'campaign' => $campaign,
            'segments' => $segments,
        ]);
    }

    public function update(UpdateNewsletterCampaignRequest $request, NewsletterCampaign $campaign): RedirectResponse
    {
        $data = $request->validated();

        $campaign->update($data);

        return back()->with('success', 'Kampania została zaktualizowana');
    }

    public function destroy(NewsletterCampaign $campaign): RedirectResponse
    {
        $campaign->delete();

        return back()->with('success', 'Kampania została usunięta');
    }

    public function send(NewsletterCampaign $campaign): RedirectResponse
    {
        if ($campaign->status !== CampaignStatusEnum::Draft->value) {
            return back()->with('error', 'Kampania została już wysłana');
        }

        $campaign->update(['status' => CampaignStatusEnum::Sending->value]);

        // Tutaj dispatch job do wysyłki

        return back()->with('success', 'Wysyłanie kampanii zostało rozpoczęte');
    }

    public function schedule(ScheduleNewsletterCampaignRequest $request, NewsletterCampaign $campaign): RedirectResponse
    {
        $data = $request->validated();

        $campaign->update([
            'status' => CampaignStatusEnum::Scheduled->value,
            'scheduled_at' => $data['scheduled_at'],
        ]);

        return back()->with('success', 'Kampania została zaplanowana');
    }

    public function duplicate(NewsletterCampaign $campaign): RedirectResponse
    {
        $newCampaign = $campaign->replicate();
        $newCampaign->name = $campaign->name.' (Kopia)';
        $newCampaign->status = CampaignStatusEnum::Draft->value;
        $newCampaign->scheduled_at = null;
        $newCampaign->started_sending_at = null;
        $newCampaign->finished_sending_at = null;
        $newCampaign->total_recipients = 0;
        $newCampaign->total_sent = 0;
        $newCampaign->total_delivered = 0;
        $newCampaign->total_opened = 0;
        $newCampaign->total_clicked = 0;
        $newCampaign->total_bounced = 0;
        $newCampaign->total_unsubscribed = 0;
        $newCampaign->save();

        return to_route('admin.newsletter.campaigns.edit', $newCampaign)->with('success', 'Kampania została skopiowana');
    }
}
