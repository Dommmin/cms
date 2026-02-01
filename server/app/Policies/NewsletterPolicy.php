<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Modules\Newsletter\Domain\Models\NewsletterSubscriber;

final class NewsletterPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('newsletter.view');
    }

    public function view(User $user, NewsletterSubscriber $newsletterSubscriber): bool
    {
        return $user->can('newsletter.view');
    }

    public function create(User $user): bool
    {
        // Public subscription is allowed, but admin creation requires permission
        return true; // Public can subscribe, but admin needs permission
    }

    public function update(User $user, NewsletterSubscriber $newsletterSubscriber): bool
    {
        return $user->can('newsletter.create');
    }

    public function delete(User $user, NewsletterSubscriber $newsletterSubscriber): bool
    {
        return $user->can('newsletter.delete');
    }

    public function send(User $user): bool
    {
        return $user->can('newsletter.send');
    }
}
