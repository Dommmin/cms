<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Modules\Forms\Domain\Events\FormSubmitted;
use App\Modules\Forms\Domain\Notifications\FormSubmissionNotification;
use Illuminate\Support\Facades\Notification;

class SendFormSubmissionNotification
{
    /**
     * Handle the event.
     */
    public function handle(FormSubmitted $event): void
    {
        $emails = $event->form->notify_emails ?? [];

        if (empty($emails) || ! is_array($emails)) {
            return;
        }

        foreach ($emails as $email) {
            if (is_string($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Notification::route('mail', $email)
                    ->notify(new FormSubmissionNotification($event->submission, $event->form));
            }
        }
    }
}
