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
        $confirmUrl = config('app.frontend_url', config('app.url')).'/newsletter/confirm?token='.$this->subscriber->token;

        return (new MailMessage)
            ->subject('Please confirm your newsletter subscription')
            ->greeting('Hello'.($this->subscriber->first_name ? ', '.$this->subscriber->first_name : '').'!')
            ->line('Thank you for subscribing to our newsletter.')
            ->line('Please click the button below to confirm your subscription.')
            ->action('Confirm Subscription', $confirmUrl)
            ->line('If you did not sign up for this newsletter, you can safely ignore this email.');
    }
}
