<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\FlashSale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Date;

class DeactivateExpiredFlashSales extends Command
{
    protected $signature = 'flash-sales:deactivate-expired';

    protected $description = 'Mark expired or stock-exhausted flash sales as inactive';

    public function handle(): int
    {
        $now = Date::now();

        $count = FlashSale::query()
            ->where('is_active', true)
            ->where(function ($query) use ($now): void {
                $query->where('ends_at', '<', $now)
                    ->orWhereColumn('stock_sold', '>=', 'stock_limit');
            })
            ->whereNotNull('stock_limit')
            ->update(['is_active' => false]);

        // Also deactivate those with null stock_limit but past ends_at
        $countNoLimit = FlashSale::query()
            ->where('is_active', true)
            ->where('ends_at', '<', $now)
            ->whereNull('stock_limit')
            ->update(['is_active' => false]);

        $total = $count + $countNoLimit;

        $this->info(sprintf('Deactivated %d expired flash sale(s).', $total));

        return Command::SUCCESS;
    }
}
