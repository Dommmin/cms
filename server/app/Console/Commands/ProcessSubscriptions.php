<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('subscriptions:process')]
#[Description('Process expired subscriptions (renew or expire)')]
final class ProcessSubscriptions extends Command
{
    public function handle(SubscriptionService $service): int
    {
        $this->info('Processing expired subscriptions...');

        $count = $service->processExpiredSubscriptions();

        $this->info(sprintf('Processed %d subscriptions.', $count));

        return self::SUCCESS;
    }
}
