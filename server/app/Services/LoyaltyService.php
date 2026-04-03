<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use App\Models\LoyaltyPoint;
use App\Models\LoyaltyTransaction;
use App\Models\Order;

class LoyaltyService
{
    public function __construct(
        private readonly int $earnRate = 1, // Points per zł spent
        private readonly int $redemptionRate = 100, // Points per zł value
        private readonly int $minRedemptionPoints = 100,
    ) {}

    public function getOrCreatePoints(Customer $customer): LoyaltyPoint
    {
        return LoyaltyPoint::firstOrCreate(
            ['customer_id' => $customer->id],
            ['balance' => 0, 'total_earned' => 0, 'total_spent' => 0]
        );
    }

    public function earnFromOrder(Order $order, int $points): LoyaltyTransaction
    {
        $customer = $order->customer;
        $loyalty = $this->getOrCreatePoints($customer);

        $loyalty->balance += $points;
        $loyalty->total_earned += $points;
        $loyalty->save();

        return LoyaltyTransaction::create([
            'customer_id' => $customer->id,
            'type' => 'earn',
            'points' => $points,
            'description' => "Points earned from order #{$order->reference_number}",
            'source_type' => Order::class,
            'source_id' => $order->id,
            'balance_after' => $loyalty->balance,
        ]);
    }

    public function spendPoints(Customer $customer, int $points, string $description): ?LoyaltyTransaction
    {
        if ($points < $this->minRedemptionPoints) {
            return null;
        }

        $loyalty = $this->getOrCreatePoints($customer);

        if ($loyalty->balance < $points) {
            return null;
        }

        $loyalty->balance -= $points;
        $loyalty->total_spent += $points;
        $loyalty->save();

        return LoyaltyTransaction::create([
            'customer_id' => $customer->id,
            'type' => 'spend',
            'points' => $points,
            'description' => $description,
            'source_type' => 'manual',
            'source_id' => null,
            'balance_after' => $loyalty->balance,
        ]);
    }

    public function calculatePointsForOrder(Order $order): int
    {
        $totalInPln = $order->total / 100; // Convert from cents

        return (int) ($totalInPln * $this->earnRate);
    }

    public function calculateDiscountValue(int $points): int
    {
        if ($points < $this->minRedemptionPoints) {
            return 0;
        }

        return (int) (($points / $this->redemptionRate) * 100); // Return cents
    }
}
