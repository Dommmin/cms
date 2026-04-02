<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\NewsletterSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewsletterConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly NewsletterSubscriber $subscriber,
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $this->subscriber->locale ?? 'en';
        $prefix = $locale !== 'en' ? '/'.$locale : '';
        $confirmUrl = config('app.frontend_url', config('app.url')).$prefix.'/newsletter/confirm?token='.$this->subscriber->token;

        $name = $this->subscriber->first_name ? ', '.$this->subscriber->first_name : '';

        return (new MailMessage)
            ->subject(__('notifications.newsletter_confirmation.subject'))
            ->greeting(str_replace(':name', $name, __('notifications.newsletter_confirmation.greeting')))
            ->line(__('notifications.newsletter_confirmation.line1'))
            ->line(__('notifications.newsletter_confirmation.line2'))
            ->action(__('notifications.newsletter_confirmation.action'), $confirmUrl)
            ->line(__('notifications.newsletter_confirmation.line3'));
    }
}
