<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\SubscriptionStatusEnum;
use App\Models\Customer;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Carbon\Carbon;

final class SubscriptionService
{
    public function create(Customer $customer, SubscriptionPlan $plan, ?string $paymentMethodId = null): Subscription
    {
        $startsAt = now();
        $trialEndsAt = null;
        $status = SubscriptionStatusEnum::Active;

        if ($plan->trial_days > 0) {
            $status = SubscriptionStatusEnum::Trial;
            $trialEndsAt = $startsAt->copy()->addDays($plan->trial_days);
        }

        $expiresAt = $this->calculateExpirationDate($startsAt, $plan);

        return Subscription::create([
            'customer_id' => $customer->id,
            'subscription_plan_id' => $plan->id,
            'status' => $status,
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
            'trial_ends_at' => $trialEndsAt,
            'next_billing_at' => $expiresAt,
            'billing_price' => $plan->price,
            'payment_method_id' => $paymentMethodId,
            'billing_cycle_count' => 0,
            'auto_renew' => true,
        ]);
    }

    public function renew(Subscription $subscription): void
    {
        if (! $subscription->auto_renew) {
            return;
        }

        $plan = $subscription->plan;
        $newExpiresAt = $this->calculateExpirationDate($subscription->expires_at ?? now(), $plan);

        $subscription->update([
            'status' => SubscriptionStatusEnum::Active,
            'expires_at' => $newExpiresAt,
            'next_billing_at' => $newExpiresAt,
            'billing_cycle_count' => $subscription->billing_cycle_count + 1,
        ]);
    }

    public function cancel(Subscription $subscription, bool $immediately = false): void
    {
        if ($immediately) {
            $subscription->update([
                'status' => SubscriptionStatusEnum::Cancelled,
                'cancelled_at' => now(),
                'expires_at' => now(),
                'auto_renew' => false,
            ]);
        } else {
            $subscription->update([
                'cancelled_at' => now(),
                'auto_renew' => false,
            ]);
        }
    }

    public function pause(Subscription $subscription): void
    {
        $subscription->update([
            'status' => SubscriptionStatusEnum::Paused,
            'paused_at' => now(),
        ]);
    }

    public function resume(Subscription $subscription): void
    {
        $subscription->update([
            'status' => SubscriptionStatusEnum::Active,
            'paused_at' => null,
        ]);
    }

    public function processExpiredSubscriptions(): int
    {
        $expiredCount = 0;

        Subscription::query()
            ->where('expires_at', '<', now())
            ->whereIn('status', [
                SubscriptionStatusEnum::Active->value,
                SubscriptionStatusEnum::Trial->value,
            ])
            ->chunk(100, function ($subscriptions) use (&$expiredCount): void {
                foreach ($subscriptions as $subscription) {
                    if ($subscription->auto_renew) {
                        $this->renew($subscription);
                    } else {
                        $subscription->update([
                            'status' => SubscriptionStatusEnum::Expired,
                        ]);
                    }
                    $expiredCount++;
                }
            });

        return $expiredCount;
    }

    private function calculateExpirationDate(Carbon $startDate, SubscriptionPlan $plan): Carbon
    {
        return match ($plan->billing_period) {
            'daily' => $startDate->copy()->addDays($plan->billing_cycle),
            'weekly' => $startDate->copy()->addWeeks($plan->billing_cycle),
            'monthly' => $startDate->copy()->addMonths($plan->billing_cycle),
            'yearly' => $startDate->copy()->addYears($plan->billing_cycle),
            default => $startDate->copy()->addMonth(),
        };
    }
}