<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentProviderEnum;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Description('Automatically cancel unpaid bank transfer and cash on delivery orders after the configured deadline.')]
#[Signature('orders:cancel-unpaid-offline')]
class CancelUnpaidOfflineOrders extends Command
{
    public function handle(): int
    {
        $deadlineDays = (int) Setting::get('payments', 'offline_payment_deadline_days', 5);
        $cutoff = now()->subDays($deadlineDays);

        // 1. Cancel unpaid Bank Transfer orders in awaiting_payment status
        $unpaidBankTransfers = Order::query()
            ->where('status', OrderStatusEnum::AWAITING->value)
            ->whereHas('payment', function ($query): void {
                $query->where('provider', PaymentProviderEnum::BANK_TRANSFER->value);
            })
            ->where('created_at', '<', $cutoff)
            ->get();

        $bankTransferCount = 0;
        foreach ($unpaidBankTransfers as $order) {
            $order->changeStatus(
                OrderStatusEnum::CANCELLED,
                'system',
                sprintf('Anulowane automatycznie po %d dniach braku wpłaty.', $deadlineDays)
            );
            $bankTransferCount++;
        }

        // 2. Cancel pending Cash on Delivery orders that were never processed/shipped and timed out
        $unpaidCODs = Order::query()
            ->where('status', OrderStatusEnum::PENDING->value)
            ->whereHas('payment', function ($query): void {
                $query->where('provider', PaymentProviderEnum::CASH_ON_DELIVERY->value);
            })
            ->where('created_at', '<', $cutoff)
            ->get();

        $codCount = 0;
        foreach ($unpaidCODs as $order) {
            $order->changeStatus(
                OrderStatusEnum::CANCELLED,
                'system',
                sprintf('Anulowane automatycznie po %d dniach oczekiwania na realizację.', $deadlineDays)
            );
            $codCount++;
        }

        $this->info(sprintf('Automatically cancelled %d unpaid bank transfer order(s).', $bankTransferCount));
        $this->info(sprintf('Automatically cancelled %d unpaid cash on delivery order(s).', $codCount));

        return self::SUCCESS;
    }
}
