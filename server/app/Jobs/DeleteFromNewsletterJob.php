<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Infrastructure\Newsletter\NewsletterProvider;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DeleteFromNewsletterJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

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
