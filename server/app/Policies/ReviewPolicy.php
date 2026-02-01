<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Modules\Reviews\Domain\Models\ProductReview;

final class ReviewPolicy
{
    public function viewAny(User $user): bool
    {
        // Public access for viewing reviews
        return true;
    }

    public function view(User $user, ProductReview $productReview): bool
    {
        // Public access for viewing reviews
        return true;
    }

    public function create(User $user): bool
    {
        // Any authenticated customer can create reviews
        return $user->hasRole('customer');
    }

    public function update(User $user, ProductReview $productReview): bool
    {
        // Users can update their own reviews, admins can update any
        if ($user->hasRole('customer')) {
            $customer = $user->customer ?? null;
            return $customer && $productReview->customer_id === $customer->id;
        }

        return $user->can('reviews.moderate');
    }

    public function delete(User $user, ProductReview $productReview): bool
    {
        // Users can delete their own reviews, admins can delete any
        if ($user->hasRole('customer')) {
            $customer = $user->customer ?? null;
            return $customer && $productReview->customer_id === $customer->id;
        }

        return $user->can('reviews.delete');
    }

    public function moderate(User $user, ProductReview $productReview): bool
    {
        return $user->can('reviews.moderate');
    }
}
