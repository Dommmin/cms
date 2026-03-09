<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\NewsletterSubscriber;
use Illuminate\Support\Str;

class NewsletterSubscriberObserver
{
    public function creating(NewsletterSubscriber $subscriber): void
    {
        $subscriber->token ??= Str::random(64);
    }
}
