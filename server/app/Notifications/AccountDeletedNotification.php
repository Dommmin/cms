<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountDeletedNotification extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your account has been deleted')
            ->greeting(sprintf('Hello %s,', $notifiable->name))
            ->line('Your account has been successfully deleted as requested.')
            ->line('Your personal data has been anonymized in accordance with our privacy policy.')
            ->line('Please note that financial records (orders, invoices) are retained as required by applicable legal and accounting obligations.')
            ->line('If you did not request this action, please contact our support team immediately.')
            ->line('Thank you for using our service.');
    }
}
