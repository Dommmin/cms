<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FormSubmissionNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly FormSubmission $submission,
        public readonly Form $form
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject("Nowe zgłoszenie formularza: {$this->form->name}")
            ->greeting('Witaj!')
            ->line("Otrzymano nowe zgłoszenie z formularza: **{$this->form->name}**")
            ->line('**Dane zgłoszenia:**');

        foreach ($this->submission->payload as $fieldName => $value) {
            $field = $this->form->fields->firstWhere('name', $fieldName);
            $label = $field?->label ?? $fieldName;
            $displayValue = is_array($value) ? implode(', ', $value) : (string) $value;
            $message->line("**{$label}:** {$displayValue}");
        }

        $message->line("**IP:** {$this->submission->ip}")
            ->line("**Data:** {$this->submission->created_at->format('Y-m-d H:i:s')}")
            ->action('Zobacz zgłoszenie', url("/admin/forms/{$this->form->id}/edit?submission={$this->submission->id}"));

        return $message;
    }
}
