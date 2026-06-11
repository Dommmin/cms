<?php

declare(strict_types=1);

namespace App\Observers;

use App\Mail\ProductRestockedMail;
use App\Models\ProductVariant;
use App\Models\ProductVariantStockSubscription;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ProductVariantStockObserver
{
    public function updated(ProductVariant $variant): void
    {
        if ($variant->isDirty('stock_quantity') && $variant->getOriginal('stock_quantity') <= 0 && $variant->stock_quantity > 0) {
            $this->notifySubscribers($variant);
        }
    }

    private function notifySubscribers(ProductVariant $variant): void
    {
        $variant->loadMissing(['product', 'attributeValues.attribute', 'attributeValues.attributeValue']);

        // Get all active subscriptions for this variant
        $subscriptions = ProductVariantStockSubscription::query()
            ->where('product_variant_id', $variant->id)
            ->whereNull('notified_at')
            ->get();

        foreach ($subscriptions as $subscription) {
            try {
                Mail::to($subscription->email)->send(new ProductRestockedMail($variant));
                $subscription->update(['notified_at' => now()]);
            } catch (Throwable $e) {
                logger()->error('Failed to send stock notification email to '.$subscription->email.': '.$e->getMessage());
            }
        }
    }
}
