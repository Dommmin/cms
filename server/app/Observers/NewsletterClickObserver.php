<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\NewsletterClick;
use Illuminate\Support\Str;

class NewsletterClickObserver
{
    public function creating(NewsletterClick $click): void
    {
        $click->tracking_token ??= Str::random(32);
    }
}
