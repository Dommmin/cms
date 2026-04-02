<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\NewsletterSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewsletterWelcomeNotification extends Notification implements ShouldQueue
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
        $unsubscribeUrl = config('app.frontend_url', config('app.url')).$prefix.'/newsletter/unsubscribe?token='.$this->subscriber->token;

        $name = $this->subscriber->first_name ? ', '.$this->subscriber->first_name : '';

        return (new MailMessage)
            ->subject(__('notifications.newsletter_welcome.subject'))
            ->greeting(str_replace(':name', $name, __('notifications.newsletter_welcome.greeting')))
            ->line(__('notifications.newsletter_welcome.line1'))
            ->line(__('notifications.newsletter_welcome.line2'))
            ->line(__('notifications.newsletter_welcome.line3'))
            ->action(__('notifications.newsletter_welcome.action'), $unsubscribeUrl);
    }
}
