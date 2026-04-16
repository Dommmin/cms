<?php

declare(strict_types=1);

namespace App\States\Order;

use App\Models\Order;
use Spatie\ModelStates\State;
use Spatie\ModelStates\StateConfig;

/**
 * @extends State<Order>
 */
abstract class OrderState extends State
{
    public static function config(): StateConfig
    {
        return parent::config()
            ->default(PendingState::class)
            ->allowTransition(DraftState::class, PendingState::class)
            ->allowTransition(DraftState::class, CancelledState::class)
            ->allowTransition(PendingState::class, ProcessingState::class)
            ->allowTransition(PendingState::class, CancelledState::class)
            ->allowTransition(AwaitingPaymentState::class, PaidState::class)
            ->allowTransition(AwaitingPaymentState::class, CancelledState::class)
            ->allowTransition(PaidState::class, ProcessingState::class)
            ->allowTransition(PaidState::class, RefundedState::class)
            ->allowTransition(ProcessingState::class, ShippedState::class)
            ->allowTransition(ProcessingState::class, CancelledState::class)
            ->allowTransition(ShippedState::class, DeliveredState::class)
            ->allowTransition(DeliveredState::class, RefundedState::class);
    }
}
