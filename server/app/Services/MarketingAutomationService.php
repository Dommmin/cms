<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\CampaignStatusEnum;
use App\Enums\CampaignTriggerEnum;
use App\Jobs\SendAutomatedCampaignJob;
use App\Models\Customer;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use App\Models\Order;
use App\Models\Product;
use App\Models\WishlistItem;
use App\Notifications\NewsletterCampaignNotification;
use Illuminate\Support\Facades\Notification;

final class MarketingAutomationService
{
    public function trigger(CampaignTriggerEnum $trigger, object $context): void
    {
        $campaigns = NewsletterCampaign::query()
            ->where('type', 'automated')
            ->where('status', CampaignStatusEnum::Ready->value)
            ->where('trigger', $trigger->value)
            ->get();

        foreach ($campaigns as $campaign) {
            $this->processCampaign($campaign, $context);
        }
    }

    public function processBirthdays(): void
    {
        $today = now()->format('m-d');

        Customer::query()
            ->whereRaw("DATE_FORMAT(birth_date, '%m-%d') = ?", [$today])
            ->whereNotNull('birth_date')
            ->each(fn (Customer $customer) => $this->trigger(CampaignTriggerEnum::OnBirthday, $customer));
    }

    public function processInactiveCustomers(): void
    {
        $inactiveDays = 30;

        Customer::query()
            ->whereHas('orders')
            ->whereDoesntHave('orders', function ($query) use ($inactiveDays): void {
                $query->where('created_at', '>=', now()->subDays($inactiveDays));
            })
            ->each(function (Customer $customer): void {
                if ($customer->user) {
                    $this->trigger(CampaignTriggerEnum::CustomerInactive, $customer);
                }
            });
    }

    private function processCampaign(NewsletterCampaign $campaign, object $context): void
    {
        $trigger = $campaign->trigger;
        if (! $trigger instanceof CampaignTriggerEnum) {
            return;
        }

        match ($trigger) {
            CampaignTriggerEnum::OnSubscribe => $context instanceof NewsletterSubscriber ? $this->handleSubscribe($campaign, $context) : null,
            CampaignTriggerEnum::OnFirstOrder => $context instanceof Order ? $this->handleFirstOrder($campaign, $context) : null,
            CampaignTriggerEnum::OnBirthday => $context instanceof Customer ? $this->handleBirthday($campaign, $context) : null,
            CampaignTriggerEnum::AfterPurchase => $context instanceof Order ? $this->handleAfterPurchase($campaign, $context) : null,
            CampaignTriggerEnum::CartAbandonment => null,
            CampaignTriggerEnum::ProductReviewRequest => $context instanceof Order ? $this->handleProductReview($campaign, $context) : null,
            CampaignTriggerEnum::WishlistBackInStock => $context instanceof Product ? $this->handleWishlistBackInStock($campaign, $context) : null,
            CampaignTriggerEnum::LoyaltyPointsEarned => $context instanceof Customer ? $this->handleLoyaltyPoints($campaign, $context) : null,
            CampaignTriggerEnum::CategoryPurchased => $context instanceof Order ? $this->handleCategoryPurchased($campaign, $context) : null,
            CampaignTriggerEnum::CustomerInactive => $context instanceof Customer ? $this->handleCustomerInactive($campaign, $context) : null,
            CampaignTriggerEnum::ProductPurchased => $context instanceof Order ? $this->handleProductPurchased($campaign, $context) : null,
        };
    }

    private function handleSubscribe(NewsletterCampaign $campaign, NewsletterSubscriber $subscriber): void
    {
        $this->sendToEmail($campaign, $subscriber->email);
    }

    private function handleFirstOrder(NewsletterCampaign $campaign, Order $order): void
    {
        $customer = $order->customer;

        $previousOrders = Order::query()
            ->where('customer_id', $customer->id)
            ->where('id', '!=', $order->id)
            ->where('status', '!=', 'cancelled')
            ->count();

        if ($previousOrders === 0) {
            $this->sendToCustomer($campaign, $customer);
        }
    }

    private function handleBirthday(NewsletterCampaign $campaign, Customer $customer): void
    {
        if (! $customer->birth_date) {
            return;
        }

        $this->sendToCustomer($campaign, $customer);
    }

    private function handleAfterPurchase(NewsletterCampaign $campaign, Order $order): void
    {
        $delay = $campaign->trigger_delay_hours ?? 0;

        if ($delay > 0) {
            $this->scheduleDelayed($campaign, $order->customer, $delay);
        } else {
            $this->sendToCustomer($campaign, $order->customer);
        }
    }

    private function handleProductReview(NewsletterCampaign $campaign, Order $order): void
    {
        $customer = $order->customer;
        $delay = $campaign->trigger_delay_hours ?? 7;

        foreach ($order->items as $item) {
            $this->scheduleDelayed($campaign, $customer, $delay);
        }
    }

    private function handleWishlistBackInStock(NewsletterCampaign $campaign, Product $product): void
    {
        $wishlistItems = $product->wishlistItems()->with('wishlist.customer.user')->get();

        /** @var WishlistItem $item */
        foreach ($wishlistItems as $item) {
            $customer = $item->wishlist->customer;
            if ($customer instanceof Customer) {
                $this->sendToCustomer($campaign, $customer);
            }
        }
    }

    private function handleLoyaltyPoints(NewsletterCampaign $campaign, Customer $customer): void
    {
        $this->sendToCustomer($campaign, $customer);
    }

    private function handleCategoryPurchased(NewsletterCampaign $campaign, Order $order): void
    {
        $this->sendToCustomer($campaign, $order->customer);
    }

    private function handleCustomerInactive(NewsletterCampaign $campaign, Customer $customer): void
    {
        $this->sendToCustomer($campaign, $customer);
    }

    private function handleProductPurchased(NewsletterCampaign $campaign, Order $order): void
    {
        $this->sendToCustomer($campaign, $order->customer);
    }

    private function sendToEmail(NewsletterCampaign $campaign, string $email): void
    {
        Notification::route('mail', $email)
            ->notify(new NewsletterCampaignNotification($campaign));
    }

    private function sendToCustomer(NewsletterCampaign $campaign, Customer $customer): void
    {
        if (! $customer->user) {
            return;
        }

        $customer->user->notify(new NewsletterCampaignNotification($campaign));
    }

    private function scheduleDelayed(NewsletterCampaign $campaign, Customer $customer, int $delayHours): void
    {
        dispatch(new SendAutomatedCampaignJob($campaign->id, $customer->id))
            ->delay(now()->addHours($delayHours));
    }
}
