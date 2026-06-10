<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Models\ProductDownloadLink;
use App\Notifications\DigitalDownloadsReadyNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class GenerateDigitalDownloadLinks implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrderPaid $event): void
    {
        $order = $event->order->load(['items.variant.downloads', 'customer.user']);
        $links = collect();

        foreach ($order->items as $item) {
            $variant = $item->variant;
            if ($variant && $variant->is_digital && $variant->downloads()->exists()) {
                // Check if link already exists for this order item to prevent duplicates
                $link = ProductDownloadLink::query()
                    ->where('order_item_id', $item->id)
                    ->first();

                if (! $link) {
                    $link = ProductDownloadLink::query()->create([
                        'order_item_id' => $item->id,
                        'product_variant_id' => $variant->id,
                        'token' => ProductDownloadLink::generateToken(),
                        'max_downloads' => $variant->download_limit,
                        'expires_at' => $variant->download_expiry_days
                            ? now()->addDays($variant->download_expiry_days)
                            : null,
                        'download_count' => 0,
                    ]);
                }

                $links->push($link);
            }
        }

        if ($links->isNotEmpty()) {
            $email = ($order->customer && $order->customer->user)
                ? $order->customer->user->email
                : $order->guest_email;

            if ($email) {
                if ($order->customer && $order->customer->user) {
                    $order->customer->user->notify(new DigitalDownloadsReadyNotification($order, $links));
                } else {
                    Notification::route('mail', $email)
                        ->notify(new DigitalDownloadsReadyNotification($order, $links));
                }
            }
        }
    }
}
