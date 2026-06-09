<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

use App\Services\InventoryService;

#[Signature('inventory:release-expired')]
#[Description('Zwalnia przeterminowane rezerwacje koszyka i przywraca stany magazynowe.')]
class ReleaseExpiredReservationsCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(InventoryService $inventoryService)
    {
        $count = $inventoryService->releaseExpiredReservations();
        $this->info("Zwolniono $count przeterminowanych rezerwacji.");
    }
}
