<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ReturnRequest;
use App\Models\User;

class ReturnPolicy
{
    public function viewAny(User $user): bool
    {
        // Users can view their own returns, admins can view all
        if ($user->hasRole('customer')) {
            return true;
        }

        return $user->can('orders.view');
    }

    public function view(User $user, ReturnRequest $returnRequest): bool
    {
        // Users can view their own returns, admins can view all
        if ($user->hasRole('customer')) {
            $customer = $user->customer ?? null;
            $order = $returnRequest->order;

            return $customer && $order && $order->customer_id === $customer->id;
        }

        return $user->can('orders.view');
    }

    public function create(User $user): bool
    {
        // Any authenticated customer can create returns
        return $user->hasRole('customer');
    }

    public function update(User $user): bool
    {
        // Only admins can update returns
        return $user->can('orders.update');
    }

    public function delete(User $user): bool
    {
        return $user->can('orders.delete');
    }
}
