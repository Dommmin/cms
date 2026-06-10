<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Order;
use App\Models\ProductDownloadLink;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class DigitalDownloadsReadyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @param  Collection<int, ProductDownloadLink>  $links
     */
    public function __construct(
        public readonly Order $order,
        public readonly Collection $links
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Twoje pliki do pobrania są gotowe – Zamówienie '.$this->order->reference_number)
            ->greeting('Cześć!')
            ->line('Dziękujemy za zakup. Pliki cyfrowe z Twojego zamówienia są gotowe do pobrania:')
            ->line('**Zamówienie:** '.$this->order->reference_number);

        foreach ($this->links as $link) {
            $variantName = $link->variant->name ?? 'Produkt cyfrowy';
            $downloadUrl = route('api.v1.downloads.show', ['token' => $link->token]);

            $mail->line(sprintf('- **%s**: [Pobierz pliki](%s)', $variantName, $downloadUrl));
        }

        $mail->line('Linki do pobrania mogą wygasnąć lub posiadać limity pobrań zgodnie z warunkami zakupu.');
        $mail->line('W razie pytań, skontaktuj się z naszym działem obsługi.');

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'reference_number' => $this->order->reference_number,
            'tokens' => $this->links->pluck('token')->toArray(),
        ];
    }
}
