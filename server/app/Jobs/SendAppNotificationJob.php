<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\NotificationChannelEnum;
use App\Enums\NotificationStatusEnum;
use App\Models\AppNotification;
use App\Notifications\AppNotificationMail;
use App\Services\PushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Throwable;

class SendAppNotificationJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 10;

    public function __construct(
        public readonly AppNotification $appNotification,
    ) {}

    public function handle(PushNotificationService $push): void
    {
        $notification = $this->appNotification;
        $notification->load('customer');

        $customer = $notification->customer;

        if (! $customer) {
            $this->markFailed('Customer not found');

            return;
        }

        try {
            match ($notification->channel) {
                NotificationChannelEnum::Email => $this->sendEmail($notification, $customer->email),
                NotificationChannelEnum::Push => $this->sendPush($notification, $push),
                NotificationChannelEnum::Sms => $this->markFailed('SMS channel not yet implemented'),
            };
        } catch (Throwable $throwable) {
            Log::error('SendAppNotificationJob failed', [
                'notification_id' => $notification->id,
                'error' => $throwable->getMessage(),
            ]);

            $this->markFailed($throwable->getMessage());

            throw $throwable;
        }
    }

    private function sendEmail(AppNotification $notification, string $email): void
    {
        Notification::route('mail', $email)
            ->notify(new AppNotificationMail($notification));

        $notification->update([
            'status' => NotificationStatusEnum::Sent,
            'sent_at' => now(),
        ]);
    }

    private function sendPush(AppNotification $notification, PushNotificationService $push): void
    {
        $meta = $notification->metadata ?? [];
        $title = $meta['subject'] ?? $notification->type->label();
        $body = $meta['body'] ?? '';
        $customer = $notification->customer;

        $user = $customer->user;

        if (! $user) {
            $this->markFailed('Customer has no associated user account for push');

            return;
        }

        $sent = $push->sendToUser($user, $title, $body, $meta['data'] ?? []);

        if ($sent > 0) {
            $notification->update([
                'status' => NotificationStatusEnum::Sent,
                'sent_at' => now(),
            ]);
        } else {
            $this->markFailed('No active push subscriptions found');
        }
    }

    private function markFailed(string $reason): void
    {
        $this->appNotification->update([
            'status' => NotificationStatusEnum::Failed,
            'error_message' => $reason,
            'failed_at' => now(),
        ]);
    }
}
