<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Cart;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AbandonedCartNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Cart $cart,
        public readonly ?string $discountCode = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('You left something behind!')
            ->greeting("Hello {$notifiable->name}!")
            ->line("It looks like you left some items in your cart. Don't forget to complete your purchase!");

        foreach ($this->cart->items as $item) {
            $mail->line("- {$item->variant?->product?->name} x{$item->quantity}");
        }

        if ($this->discountCode) {
            $mail->line("Use code **{$this->discountCode}** to get a discount on your order.");
        }

        return $mail
            ->action('Complete Your Purchase', url('/cart'))
            ->line('This offer may expire soon — secure your items today.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'cart_id' => $this->cart->id,
        ];
    }
}
