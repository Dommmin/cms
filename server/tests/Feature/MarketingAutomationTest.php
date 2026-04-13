<?php

declare(strict_types=1);

use App\Enums\CampaignStatusEnum;
use App\Enums\CampaignTriggerEnum;
use App\Enums\CampaignTypeEnum;
use App\Models\Customer;
use App\Models\NewsletterCampaign;
use App\Models\Order;
use App\Models\User;
use App\Notifications\NewsletterCampaignNotification;
use App\Services\MarketingAutomationService;
use Illuminate\Support\Facades\Notification;

beforeEach(function (): void {
    Notification::fake();
});

it('triggers automated campaigns on first order', function (): void {
    $user = User::factory()->create();
    $customer = Customer::factory()->create(['user_id' => $user->id]);

    $campaign = NewsletterCampaign::factory()->create([
        'type' => CampaignTypeEnum::Automated,
        'status' => CampaignStatusEnum::Ready,
        'trigger' => CampaignTriggerEnum::OnFirstOrder,
        'subject' => 'Welcome to your first order!',
    ]);

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
    ]);

    $service = resolve(MarketingAutomationService::class);
    $service->trigger(CampaignTriggerEnum::OnFirstOrder, $order);

    Notification::assertSentTo($user, NewsletterCampaignNotification::class);
});

it('does not trigger first order campaign on subsequent orders', function (): void {
    $user = User::factory()->create();
    $customer = Customer::factory()->create(['user_id' => $user->id]);

    Order::factory()->create(['customer_id' => $customer->id]);

    $campaign = NewsletterCampaign::factory()->create([
        'type' => CampaignTypeEnum::Automated,
        'status' => CampaignStatusEnum::Ready,
        'trigger' => CampaignTriggerEnum::OnFirstOrder,
    ]);

    $newOrder = Order::factory()->create(['customer_id' => $customer->id]);

    $service = resolve(MarketingAutomationService::class);
    $service->trigger(CampaignTriggerEnum::OnFirstOrder, $newOrder);

    Notification::assertNotSentTo($user, NewsletterCampaignNotification::class);
});

it('does not send campaigns for inactive campaigns', function (): void {
    $user = User::factory()->create();
    $customer = Customer::factory()->create(['user_id' => $user->id]);

    NewsletterCampaign::factory()->create([
        'type' => CampaignTypeEnum::Automated,
        'status' => CampaignStatusEnum::Draft,
        'trigger' => CampaignTriggerEnum::OnFirstOrder,
    ]);

    $order = Order::factory()->create(['customer_id' => $customer->id]);

    $service = resolve(MarketingAutomationService::class);
    $service->trigger(CampaignTriggerEnum::OnFirstOrder, $order);

    Notification::assertNotSentTo($user, NewsletterCampaignNotification::class);
});
