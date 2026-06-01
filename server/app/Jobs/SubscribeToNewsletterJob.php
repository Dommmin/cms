<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Infrastructure\Newsletter\NewsletterProvider;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SubscribeToNewsletterJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

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
