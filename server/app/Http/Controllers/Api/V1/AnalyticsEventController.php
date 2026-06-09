<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\StoreAnalyticsEventRequest;
use App\Models\AnalyticsEvent;
use Illuminate\Http\JsonResponse;

class AnalyticsEventController extends ApiController
{
    public function store(StoreAnalyticsEventRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $event = AnalyticsEvent::query()->create([
            'session_id' => $validated['session_id'],
            'event_name' => $validated['event_name'],
            'product_id' => $validated['product_id'] ?? null,
            'product_variant_id' => $validated['product_variant_id'] ?? null,
            'url' => $validated['url'] ?? null,
            'referrer' => $validated['referrer'] ?? null,
            'metadata' => $validated['metadata'] ?? null,
        ]);

        return $this->created([
            'message' => 'Event recorded.',
            'id' => $event->id,
        ]);
    }
}
