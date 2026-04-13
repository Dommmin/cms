<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\NewsletterCampaign;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class NewsletterCampaignNotification extends Notification
{
    public function __construct(
        private readonly NewsletterCampaign $campaign
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->campaign->subject)
            ->from($this->campaign->sender_email, $this->campaign->sender_name);

        if ($this->campaign->preview_text) {
            $mail->introLine($this->campaign->preview_text);
        }

        if ($this->campaign->html_content) {
            $mail->view('emails.newsletter.campaign', [
                'content' => $this->campaign->html_content,
                'campaign' => $this->campaign,
            ]);
        } else {
            $mail->line($this->campaign->plain_text_content ?? '');
        }

        return $mail;
    }
}
