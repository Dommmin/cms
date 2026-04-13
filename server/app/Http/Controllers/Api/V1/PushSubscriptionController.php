<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Services\PushNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PushSubscriptionController extends ApiController
{
    public function __construct(
        private readonly PushNotificationService $pushService
    ) {}

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'url'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
        ]);

        $subscription = $this->pushService->subscribe(
            $request->user(),
            $validated
        );

        return $this->ok([
            'message' => 'Push subscription created successfully.',
            'subscription_id' => $subscription->id,
        ]);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'url'],
        ]);

        $this->pushService->unsubscribe($validated['endpoint']);

        return $this->noContent();
    }

    public function getPublicKey(): JsonResponse
    {
        $publicKey = config('services.webpush.public_key');

        return $this->ok([
            'public_key' => $publicKey,
        ]);
    }
}
