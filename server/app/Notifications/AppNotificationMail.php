<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\AppNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppNotificationMail extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly AppNotification $appNotification,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $meta = $this->appNotification->metadata ?? [];
        $subject = $meta['subject'] ?? $this->appNotification->type->label();
        $body = $meta['body'] ?? '';
        $actionUrl = $meta['action_url'] ?? null;
        $actionLabel = $meta['action_label'] ?? 'View';

        $mail = (new MailMessage)
            ->subject($subject)
            ->line($body);

        if ($actionUrl) {
            $mail->action($actionLabel, $actionUrl);
        }

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'app_notification_id' => $this->appNotification->id,
            'type' => $this->appNotification->type->value,
        ];
    }
}
