<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Modules\Ecommerce\Domain\Models\Order;

final class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        // Users can view their own orders, admins can view all
        return $user->hasRole('customer') || $user->can('orders.view');
    }

    public function view(User $user, Order $order): bool
    {
        // Users can view their own orders, admins can view all
        if ($user->hasRole('customer')) {
            $customer = $user->customer ?? null;
            return $customer && $order->customer_id === $customer->id;
        }

        return $user->can('orders.view');
    }

    public function create(User $user): bool
    {
        // Any authenticated user can create orders
        return $user->hasRole('customer');
    }

    public function update(User $user, Order $order): bool
    {
        return $user->can('orders.update');
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->can('orders.delete');
    }

    public function fulfill(User $user, Order $order): bool
    {
        return $user->can('orders.fulfill');
    }
}
