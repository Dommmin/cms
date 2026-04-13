<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\UpdateNotificationPreferencesRequest;
use App\Models\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends ApiController
{
    private const array CHANNELS = ['email', 'sms', 'push'];

    private const array EVENTS = [
        'order_status',
        'return_status',
        'promotions',
        'newsletter',
        'review_response',
        'back_in_stock',
    ];

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $saved = NotificationPreference::query()
            ->where('user_id', $user->id)
            ->get()
            ->keyBy(fn ($p): string => sprintf('%s:%s', $p->channel, $p->event));

        $preferences = [];

        foreach (self::EVENTS as $event) {
            $preferences[$event] = [];
            foreach (self::CHANNELS as $channel) {
                $key = sprintf('%s:%s', $channel, $event);
                $preferences[$event][$channel] = $saved->has($key)
                    ? $saved->get($key)->is_enabled
                    : true; // default: enabled
            }
        }

        return $this->ok(['preferences' => $preferences]);
    }

    public function update(UpdateNotificationPreferencesRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        foreach ($data['preferences'] as $pref) {
            NotificationPreference::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'customer_id' => null,
                    'channel' => $pref['channel'],
                    'event' => $pref['event'],
                ],
                ['is_enabled' => $pref['is_enabled']],
            );
        }

        return $this->ok(['message' => 'Notification preferences updated.']);
    }
}
