<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ProductVariant;
use App\Models\Setting;
use App\Notifications\LowStockNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Notification;

class SendLowStockAlerts implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $alertEmail = Setting::get('inventory', 'low_stock_alert_email');

        if (! $alertEmail) {
            return;
        }

        $lowStockVariants = ProductVariant::query()
            ->with('product')
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->whereColumn('stock_quantity', '<=', 'stock_threshold')
            ->where('stock_threshold', '>', 0)
            ->get();

        if ($lowStockVariants->isEmpty()) {
            return;
        }

        Notification::route('mail', $alertEmail)
            ->notify(new LowStockNotification($lowStockVariants));
    }
}
