<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Enums\CampaignTriggerEnum;
use App\Events\OrderCreated;
use App\Services\MarketingAutomationService;
use Illuminate\Events\Attributes\AsListener;

#[AsListener(event: OrderCreated::class)]
final class TriggerMarketingAutomation
{
    public function __construct(
        private readonly MarketingAutomationService $service
    ) {}

    public function handle(OrderCreated $event): void
    {
        $this->service->trigger(CampaignTriggerEnum::OnFirstOrder, $event->order);
        $this->service->trigger(CampaignTriggerEnum::AfterPurchase, $event->order);
        $this->service->trigger(CampaignTriggerEnum::ProductReviewRequest, $event->order);
    }
}