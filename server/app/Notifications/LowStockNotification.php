<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\ProductVariant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  Collection<int, ProductVariant>  $variants
     */
    public function __construct(
        public readonly Collection $variants,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Low Stock Alert – Action Required')
            ->greeting('Hello!')
            ->line('The following product variants are running low on stock:');

        foreach ($this->variants as $variant) {
            $mail->line(sprintf('- **%s** (%s): %d remaining (threshold: %d)', $variant->product?->name, $variant->sku, $variant->stock_quantity, $variant->stock_threshold));
        }

        return $mail
            ->action('Manage Inventory', url('/admin/ecommerce/products'))
            ->line('Please restock these items soon to avoid out-of-stock situations.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'variant_ids' => $this->variants->pluck('id')->all(),
            'count' => $this->variants->count(),
        ];
    }
}
