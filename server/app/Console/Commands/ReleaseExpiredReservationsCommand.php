<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\InventoryService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('inventory:release-expired')]
#[Description('Zwalnia przeterminowane rezerwacje koszyka i przywraca stany magazynowe.')]
class ReleaseExpiredReservationsCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(InventoryService $inventoryService): void
    {
        $count = $inventoryService->releaseExpiredReservations();
        $this->info(sprintf('Zwolniono %d przeterminowanych rezerwacji.', $count));
    }
}
