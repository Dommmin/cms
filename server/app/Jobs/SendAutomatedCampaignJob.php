<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Customer;
use App\Models\NewsletterCampaign;
use App\Notifications\NewsletterCampaignNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class SendAutomatedCampaignJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $campaignId,
        private readonly int $customerId,
        private readonly array $context = []
    ) {}

    public function handle(): void
    {
        $campaign = NewsletterCampaign::query()->find($this->campaignId);
        $customer = Customer::query()->find($this->customerId);

        if (! $campaign || ! $customer || ! $customer->user) {
            return;
        }

        $customer->user->notify(new NewsletterCampaignNotification($campaign));
    }
}
