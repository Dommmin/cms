<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Storage;

class OrderConfirmedNotification extends Notification implements ShouldQueue
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
            ->subject('Order Confirmed – '.$this->order->reference_number)
            ->greeting(sprintf('Hello %s!', $notifiable->name))
            ->line("Thank you for your order! We've received your order and it's being processed.")
            ->line('**Order:** '.$this->order->reference_number)
            ->line('**Total:** '.$this->order->formattedTotal())
            ->line('**Status:** '.OrderStatusEnum::from((string) $this->order->status)->getLabel())
            ->action('View Order', url('/orders/'.$this->order->reference_number))
            ->line('If you have any questions, please contact our support team.');

        $this->attachInvoice($mail);

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'reference_number' => $this->order->reference_number,
        ];
    }

    private function attachInvoice(MailMessage $mail): void
    {
        $filename = sprintf('invoice-%s.pdf', $this->order->reference_number);
        $storagePath = 'invoices/'.$filename;

        Storage::makeDirectory('invoices');

        try {
            resolve(InvoiceService::class)->save($this->order, Storage::path($storagePath));

            $mail->attachData(
                Storage::get($storagePath),
                $filename,
                ['mime' => 'application/pdf']
            );
        } finally {
            Storage::delete($storagePath);
        }
    }
}
