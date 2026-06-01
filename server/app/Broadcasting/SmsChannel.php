<?php

declare(strict_types=1);

namespace App\Broadcasting;

use App\Services\SmsService;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Throwable;

class SmsChannel
{
    public function __construct(
        private readonly SmsService $smsService
    ) {}

    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toSms')) {
            return;
        }

        $to = $notifiable->routeNotificationFor('sms', $notification);

        if (! $to) {
            return;
        }

        $message = $notification->toSms($notifiable);

        if (empty($message)) {
            return;
        }

        try {
            $this->smsService->send((string) $to, (string) $message);
        } catch (Throwable $throwable) {
            Log::error('Failed to send SMS notification', [
                'to' => $to,
                'message' => $message,
                'error' => $throwable->getMessage(),
            ]);
        }
    }
}
