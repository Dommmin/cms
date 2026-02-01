<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Modules\Ecommerce\Domain\Models\Category;

final class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        // Public access for viewing categories
        return true;
    }

    public function view(User $user, Category $category): bool
    {
        // Public access for viewing categories
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('categories.create');
    }

    public function update(User $user, Category $category): bool
    {
        return $user->can('categories.update');
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->can('categories.delete');
    }
}
