<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Cart;
use Illuminate\Console\Command;

class CleanAbandonedCarts extends Command
{
    protected $signature = 'cart:clean
                            {--auth-days=30 : Days before authenticated cart is deleted}
                            {--guest-days=7 : Days before guest cart is deleted}';

    protected $description = 'Delete old abandoned carts (30 days for auth, 7 days for guest)';

    public function handle(): int
    {
        $authDays = (int) $this->option('auth-days');
        $guestDays = (int) $this->option('guest-days');

        $authDeleted = Cart::query()
            ->whereNotNull('customer_id')
            ->where('updated_at', '<', now()->subDays($authDays))
            ->delete();

        $guestDeleted = Cart::query()
            ->whereNull('customer_id')
            ->where('updated_at', '<', now()->subDays($guestDays))
            ->delete();

        $this->info(sprintf('Deleted %d authenticated cart(s) older than %d days.', $authDeleted, $authDays));
        $this->info(sprintf('Deleted %d guest cart(s) older than %d days.', $guestDeleted, $guestDays));

        return self::SUCCESS;
    }
}
