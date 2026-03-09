<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Order $order
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('How was your order? Share your thoughts!')
            ->greeting("Hello {$notifiable->name}!")
            ->line("Your order **{$this->order->reference_number}** has been delivered. We hope you love your purchase!")
            ->line("We'd love to hear what you think. Your feedback helps other shoppers and helps us improve.");

        foreach ($this->order->items as $item) {
            $slug = $item->variant?->product?->slug;
            if ($slug) {
                $reviewUrl = url("/products/{$slug}?review=1");
                $mail->action("Review: {$item->product_name}", $reviewUrl);
            }
        }

        return $mail->line('Thank you for shopping with us!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'reference_number' => $this->order->reference_number,
        ];
    }
}
