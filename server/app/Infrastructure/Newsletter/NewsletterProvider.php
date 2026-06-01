<?php

declare(strict_types=1);

namespace App\Infrastructure\Newsletter;

interface NewsletterProvider
{
    /**
     * Subscribe an email address to the newsletter list.
     * Should handle both new subscriptions and updating existing ones (e.g., resubscribing).
     */
    public function subscribe(string $email, array $attributes = []): void;

    /**
     * Unsubscribe an email address from the newsletter list.
     */
    public function unsubscribe(string $email): void;

    /**
     * Delete a subscriber completely from the mailing list provider.
     */
    public function delete(string $email): void;
}
