<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Modules\Ecommerce\Domain\Models\Cart;

final class CartPolicy
{
    public function viewAny(User $user): bool
    {
        // Only authenticated users can view carts
        return $user->hasRole('customer');
    }

    public function view(User $user, Cart $cart): bool
    {
        // Users can only view their own cart
        $customer = $user->customer ?? null;
        return $customer && $cart->customer_id === $customer->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('customer');
    }

    public function update(User $user, Cart $cart): bool
    {
        $customer = $user->customer ?? null;
        return $customer && $cart->customer_id === $customer->id;
    }

    public function delete(User $user, Cart $cart): bool
    {
        $customer = $user->customer ?? null;
        return $customer && $cart->customer_id === $customer->id;
    }
}
