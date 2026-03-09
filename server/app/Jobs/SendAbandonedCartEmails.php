<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Cart;
use App\Models\Setting;
use App\Notifications\AbandonedCartNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendAbandonedCartEmails implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $hours = (int) (Setting::get('cart', 'abandoned_cart_hours') ?? 24);
        $discountCode = Setting::get('cart', 'abandoned_cart_discount_code');

        $threshold = now()->subHours($hours);

        Cart::query()
            ->with(['items.variant.product', 'customer.user'])
            ->whereNotNull('customer_id')
            ->whereHas('items')
            ->whereDoesntHave('customer.orders', function ($query): void {
                $query->where('created_at', '>=', now()->subHours(48));
            })
            ->whereBetween('updated_at', [
                $threshold->copy()->subHours(1),
                $threshold,
            ])
            ->each(function (Cart $cart) use ($discountCode): void {
                $user = $cart->customer?->user;

                if (! $user) {
                    return;
                }

                $user->notify(new AbandonedCartNotification($cart, $discountCode));
            });
    }
}
