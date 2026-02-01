<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Modules\Core\Domain\Models\Setting;

final class SettingsPolicy
{
    public function viewAny(User $user): bool
    {
        // Public settings can be viewed by anyone, admin settings require permission
        return true; // Public settings are accessible, admin settings need permission
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

    public function update(User $user, Setting $setting): bool
    {
        return $user->can('settings.update');
    }

    public function delete(User $user, Setting $setting): bool
    {
        return $user->can('settings.update');
    }
}
