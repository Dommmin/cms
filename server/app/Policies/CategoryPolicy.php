<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('categories.view');
    }

    public function view(User $user): bool
    {
        return $user->can('categories.view');
    }

    public function create(User $user): bool
    {
        return $user->can('categories.create');
    }

    public function update(User $user): bool
    {
        return $user->can('categories.update');
    }

    public function delete(User $user): bool
    {
        return $user->can('categories.delete');
    }
}
