<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Order $order,
        public readonly OrderStatusEnum $previousStatus
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject('Order Update – '.$this->order->reference_number)
            ->greeting(sprintf('Hello %s!', $notifiable->name))
            ->line('Your order status has been updated.')
            ->line('**Order:** '.$this->order->reference_number)
            ->line('**New Status:** '.OrderStatusEnum::from((string) $this->order->status)->getLabel());

        if (OrderStatusEnum::from((string) $this->order->status) === OrderStatusEnum::SHIPPED) {
            $shipment = $this->order->shipment;
            if ($shipment?->tracking_number) {
                $message->line('**Tracking:** '.$shipment->tracking_number);
            }
        }

        return $message
            ->action('View Order', url('/orders/'.$this->order->reference_number))
            ->line('Thank you for shopping with us!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'reference_number' => $this->order->reference_number,
            'status' => (string) $this->order->status,
            'previous_status' => $this->previousStatus->value,
        ];
    }
}
