<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\CustomerNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

final class NotificationCenterController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $notifications = CustomerNotification::query()
            ->where('user_id', $request->user()->id)->latest()
            ->paginate(15);

        return $this->ok([
            'data' => $notifications->map(fn (CustomerNotification $n): array => $this->formatNotification($n)),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    public function markRead(Request $request, CustomerNotification $notification): JsonResponse
    {
        abort_if(
            $notification->user_id !== $request->user()->id,
            403,
            'Forbidden'
        );

        $notification->markAsRead();

        return $this->ok($this->formatNotification($notification->fresh() ?? $notification));
    }

    public function markAllRead(Request $request): JsonResponse
    {
        CustomerNotification::query()
            ->where('user_id', $request->user()->id)
            ->unread()
            ->update(['read_at' => Date::now()]);

        return $this->noContent();
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = CustomerNotification::query()
            ->where('user_id', $request->user()->id)
            ->unread()
            ->count();

        return $this->ok(['count' => $count]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatNotification(CustomerNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'body' => $notification->body,
            'data' => $notification->data,
            'read_at' => $notification->read_at?->toIso8601String(),
            'action_url' => $notification->action_url,
            'created_at' => $notification->created_at?->toIso8601String(),
        ];
    }
}
