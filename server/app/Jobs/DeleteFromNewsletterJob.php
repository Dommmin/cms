<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Infrastructure\Newsletter\NewsletterProvider;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DeleteFromNewsletterJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public readonly string $email
    ) {}

    public function handle(NewsletterProvider $provider): void
    {
        $provider->delete($this->email);
    }
}
