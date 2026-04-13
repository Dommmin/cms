<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\MarketingAutomationService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('marketing:process')]
#[Description('Process automated marketing campaigns (birthdays, inactive customers)')]
final class ProcessMarketingAutomation extends Command
{
    public function handle(MarketingAutomationService $service): int
    {
        $this->info('Processing birthdays...');
        $service->processBirthdays();
        $this->info('Birthdays processed.');

        $this->info('Processing inactive customers...');
        $service->processInactiveCustomers();
        $this->info('Inactive customers processed.');

        return self::SUCCESS;
    }
}
