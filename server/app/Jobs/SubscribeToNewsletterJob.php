<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Infrastructure\Newsletter\NewsletterProvider;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SubscribeToNewsletterJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60; // Wait 60s before retry

    public function __construct(
        public readonly string $email,
        public readonly array $attributes = []
    ) {}

    public function handle(NewsletterProvider $provider): void
    {
        $provider->subscribe($this->email, $this->attributes);
    }
}
