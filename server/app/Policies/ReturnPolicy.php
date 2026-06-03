<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ReturnRequest;
use App\Models\User;

class ReturnPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->hasRole('customer')) {
            return true;
        }

        return $this->canViewReturns($user);
    }

    public function view(User $user, ReturnRequest $returnRequest): bool
    {
        if ($this->ownsReturn($user, $returnRequest)) {
            return true;
        }

        return $this->canViewReturns($user);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('customer');
    }

    public function update(User $user, ReturnRequest $returnRequest): bool
    {
        return $this->canManageReturns($user);
    }

    public function delete(User $user, ReturnRequest $returnRequest): bool
    {
        return $this->canManageReturns($user);
    }

    public function refund(User $user, ReturnRequest $returnRequest): bool
    {
        return $this->canRefundReturns($user);
    }

    private function ownsReturn(User $user, ReturnRequest $returnRequest): bool
    {
        if (! $user->hasRole('customer')) {
            return false;
        }

        $customer = $user->customer ?? null;

        return $customer !== null && $returnRequest->order->customer_id === $customer->id;
    }

    private function canViewReturns(User $user): bool
    {
        if ($user->can('returns.view')) {
            return true;
        }

        if ($user->can('orders.view')) {
            return true;
        }

        if ($this->canManageReturns($user)) {
            return true;
        }

        return $this->canRefundReturns($user);
    }

    private function canManageReturns(User $user): bool
    {
        if ($user->can('returns.manage')) {
            return true;
        }

        return $user->can('orders.manage');
    }

    private function canRefundReturns(User $user): bool
    {
        if ($user->can('returns.refund')) {
            return true;
        }

        return $user->can('orders.refund');
    }
}
