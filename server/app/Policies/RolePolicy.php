<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.assign_roles');
    }

    public function view(User $user): bool
    {
        return $user->can('users.assign_roles');
    }

    public function create(User $user): bool
    {
        return $user->can('users.assign_roles');
    }

    public function update(User $user): bool
    {
        return $user->can('users.assign_roles');
    }

    public function delete(User $user): bool
    {
        return $user->can('users.assign_roles');
    }

    public function restore(User $user): bool
    {
        return $user->can('users.assign_roles');
    }

    public function forceDelete(User $user): bool
    {
        return $user->can('users.assign_roles');
    }
}
