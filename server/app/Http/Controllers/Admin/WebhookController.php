<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\DeliverWebhookJob;
use App\Models\Webhook;
use App\Models\WebhookDelivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class WebhookController extends Controller
{
    public function index(): Response
    {
        $webhooks = Webhook::query()
            ->withCount('deliveries')
            ->with(['deliveries' => static function ($q): void {
                $q->latest()->limit(1);
            }])
            ->latest()
            ->get()
            ->map(static function (Webhook $webhook): Webhook {
                $webhook->setAttribute(
                    'last_delivery_status',
                    $webhook->deliveries->first()?->status
                );
                $webhook->unsetRelation('deliveries');

                return $webhook;
            });

        return Inertia::render('admin/webhooks/index', [
            'webhooks' => $webhooks,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/webhooks/create', [
            'available_events' => $this->availableEvents(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:2048'],
            'description' => ['nullable', 'string', 'max:1000'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['required', 'string', 'in:'.implode(',', $this->availableEvents())],
            'is_active' => ['boolean'],
        ]);

        $webhook = Webhook::query()->create($validated);

        return to_route('admin.webhooks.index')
            ->with('success', sprintf('Webhook "%s" created successfully.', $webhook->name));
    }

    public function edit(Webhook $webhook): Response
    {
        return Inertia::render('admin/webhooks/edit', [
            'webhook' => $webhook,
            'available_events' => $this->availableEvents(),
        ]);
    }

    public function update(Request $request, Webhook $webhook): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:2048'],
            'description' => ['nullable', 'string', 'max:1000'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['required', 'string', 'in:'.implode(',', $this->availableEvents())],
            'is_active' => ['boolean'],
        ]);

        $webhook->update($validated);

        return to_route('admin.webhooks.index')
            ->with('success', sprintf('Webhook "%s" updated successfully.', $webhook->name));
    }

    public function destroy(Webhook $webhook): RedirectResponse
    {
        $webhook->delete();

        return to_route('admin.webhooks.index')
            ->with('success', 'Webhook deleted successfully.');
    }

    public function deliveries(Webhook $webhook): Response
    {
        $deliveries = $webhook->deliveries()
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/webhooks/deliveries', [
            'webhook' => $webhook,
            'deliveries' => $deliveries,
        ]);
    }

    public function test(Webhook $webhook): JsonResponse
    {
        $payload = [
            'id' => fake()->uuid(),
            'test' => true,
            'message' => 'This is a test webhook delivery.',
        ];

        dispatch_sync(new DeliverWebhookJob($webhook, 'webhook.test', $payload));

        /** @var WebhookDelivery|null $latestDelivery */
        $latestDelivery = $webhook->deliveries()->latest()->first();

        return response()->json([
            'success' => $latestDelivery?->status === 'success',
            'status' => $latestDelivery?->status,
            'response_status' => $latestDelivery?->response_status,
            'duration_ms' => $latestDelivery?->duration_ms,
        ]);
    }

    private function availableEvents(): array
    {
        return [
            'order.created',
            'order.paid',
            'order.cancelled',
            'order.shipped',
            'order.delivered',
            'customer.created',
            'customer.updated',
            'product.created',
            'product.updated',
            'product.deleted',
            'return.requested',
            'return.approved',
        ];
    }
}
