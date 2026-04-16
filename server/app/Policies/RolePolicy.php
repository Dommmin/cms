<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('roles.view');
    }

    public function view(User $user): bool
    {
        return $user->can('roles.view');
    }

    public function create(User $user): bool
    {
        return $user->can('roles.edit');
    }

    public function update(User $user): bool
    {
        return $user->can('roles.edit');
    }

    public function delete(User $user): bool
    {
        return $user->can('roles.edit');
    }

    public function restore(User $user): bool
    {
        return false;
    }

    public function forceDelete(User $user): bool
    {
        return false;
    }
}
