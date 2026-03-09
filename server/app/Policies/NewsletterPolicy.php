<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

class NewsletterPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('newsletter.view');
    }

    public function view(User $user): bool
    {
        return $user->can('newsletter.view');
    }

    public function create(): bool
    {
        // Public subscription is allowed, but admin creation requires permission
        return true;
        // Public can subscribe, but admin needs permission
    }

    public function update(User $user): bool
    {
        return $user->can('newsletter.create');
    }

    public function delete(User $user): bool
    {
        return $user->can('newsletter.delete');
    }

    public function send(User $user): bool
    {
        return $user->can('newsletter.send');
    }
}
