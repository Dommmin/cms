<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Modules\Ecommerce\Domain\Models\Wishlist;

final class WishlistPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('customer');
    }

    public function view(User $user, Wishlist $wishlist): bool
    {
        // Users can view their own wishlists or public wishlists
        $customer = $user->customer ?? null;
        if ($customer && $wishlist->customer_id === $customer->id) {
            return true;
        }

        return $wishlist->is_public;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('customer');
    }

    public function update(User $user, Wishlist $wishlist): bool
    {
        $customer = $user->customer ?? null;
        return $customer && $wishlist->customer_id === $customer->id;
    }

    public function delete(User $user, Wishlist $wishlist): bool
    {
        $customer = $user->customer ?? null;
        return $customer && $wishlist->customer_id === $customer->id;
    }
}
