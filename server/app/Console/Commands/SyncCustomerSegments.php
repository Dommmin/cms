<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:sync-customer-segments')]
#[Description('Command description')]
class SyncCustomerSegments extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        //
    }
}
