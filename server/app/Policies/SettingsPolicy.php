<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Setting;
use App\Models\User;

class SettingsPolicy
{
    public function viewAny(): bool
    {
        // Public settings can be viewed by anyone, admin settings require permission
        return true;
        // Public settings are accessible, admin settings need permission
    }

    public function view(User $user, Setting $setting): bool
    {
        // Public settings can be viewed by anyone
        if ($setting->is_public) {
            return true;
        }

        return $user->can('settings.view');
    }

    public function create(User $user): bool
    {
        return $user->can('settings.update');
    }

    public function update(User $user): bool
    {
        return $user->can('settings.update');
    }

    public function delete(User $user): bool
    {
        return $user->can('settings.update');
    }
}
