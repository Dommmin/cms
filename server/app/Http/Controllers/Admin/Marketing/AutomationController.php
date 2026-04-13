<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Marketing;

use App\Enums\CampaignStatusEnum;
use App\Enums\CampaignTriggerEnum;
use App\Enums\CampaignTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAutomationRequest;
use App\Http\Requests\Admin\UpdateAutomationRequest;
use App\Models\NewsletterCampaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class AutomationController extends Controller
{
    public function index(Request $request): Response
    {
        $campaigns = NewsletterCampaign::query()
            ->where('type', CampaignTypeEnum::Automated->value)
            ->withCount('sends')
            ->latest()
            ->get();

        return inertia('admin/marketing/automations/index', [
            'campaigns' => $campaigns->map(fn (NewsletterCampaign $c): array => [
                'id' => $c->id,
                'name' => $c->name,
                'trigger' => $c->trigger?->value,
                'trigger_label' => $c->trigger?->label(),
                'status' => $c->status->value,
                'status_label' => $c->status->label(),
                'total_sent' => $c->total_sent,
                'sends_count' => $c->sends_count,
                'scheduled_at' => $c->scheduled_at?->toISOString(),
                'created_at' => $c->created_at?->toISOString(),
            ]),
        ]);
    }

    public function create(): Response
    {
        $triggers = array_map(
            fn (CampaignTriggerEnum $t): array => [
                'value' => $t->value,
                'label' => $t->label(),
            ],
            CampaignTriggerEnum::cases()
        );

        return inertia('admin/marketing/automations/create', [
            'triggers' => $triggers,
        ]);
    }

    public function store(StoreAutomationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $senderName = config('mail.from.name', config('app.name'));
        $senderEmail = config('mail.from.address', 'noreply@example.com');

        NewsletterCampaign::query()->create([
            'name' => $data['name'],
            'subject' => $data['subject'],
            'html_content' => $data['content'],
            'trigger' => $data['trigger'],
            'status' => $data['status'] ?? CampaignStatusEnum::Draft->value,
            'type' => CampaignTypeEnum::Automated->value,
            'sender_name' => $senderName,
            'sender_email' => $senderEmail,
        ]);

        return to_route('admin.marketing.automations.index')
            ->with('success', 'Automatyzacja została utworzona.');
    }

    public function edit(NewsletterCampaign $automation): Response
    {
        $triggers = array_map(
            fn (CampaignTriggerEnum $t): array => [
                'value' => $t->value,
                'label' => $t->label(),
            ],
            CampaignTriggerEnum::cases()
        );

        return inertia('admin/marketing/automations/edit', [
            'automation' => [
                'id' => $automation->id,
                'name' => $automation->name,
                'subject' => $automation->subject,
                'content' => $automation->html_content,
                'trigger' => $automation->trigger?->value,
                'status' => $automation->status->value,
            ],
            'triggers' => $triggers,
        ]);
    }

    public function update(UpdateAutomationRequest $request, NewsletterCampaign $automation): RedirectResponse
    {
        $data = $request->validated();

        $automation->update([
            'name' => $data['name'] ?? $automation->name,
            'subject' => $data['subject'] ?? $automation->subject,
            'html_content' => $data['content'] ?? $automation->html_content,
            'trigger' => $data['trigger'] ?? $automation->trigger?->value,
            'status' => $data['status'] ?? $automation->status->value,
        ]);

        return back()->with('success', 'Automatyzacja została zaktualizowana.');
    }

    public function destroy(NewsletterCampaign $automation): RedirectResponse
    {
        $automation->delete();

        return to_route('admin.marketing.automations.index')
            ->with('success', 'Automatyzacja została usunięta.');
    }

    public function toggle(NewsletterCampaign $automation): RedirectResponse
    {
        $newStatus = $automation->status === CampaignStatusEnum::Ready
            ? CampaignStatusEnum::Draft
            : CampaignStatusEnum::Ready;

        $automation->update(['status' => $newStatus->value]);

        return back()->with('success', 'Status automatyzacji został zmieniony.');
    }
}
