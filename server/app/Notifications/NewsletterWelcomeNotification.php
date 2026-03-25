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
        $unsubscribeUrl = config('app.frontend_url', config('app.url')).'/newsletter/unsubscribe?token='.$this->subscriber->token;

        return (new MailMessage)
            ->subject('Welcome to our newsletter!')
            ->greeting('Welcome'.($this->subscriber->first_name ? ', '.$this->subscriber->first_name : '').'!')
            ->line("Your subscription has been confirmed. You're now on our list!")
            ->line("You'll receive updates about new products, promotions, and news from us.")
            ->line('If you ever want to unsubscribe, click the link below.')
            ->action('Unsubscribe', $unsubscribeUrl);
    }
}
