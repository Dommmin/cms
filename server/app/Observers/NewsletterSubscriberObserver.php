<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\DeleteFromNewsletterJob;
use App\Jobs\SubscribeToNewsletterJob;
use App\Jobs\UnsubscribeFromNewsletterJob;
use App\Models\NewsletterSubscriber;
use Illuminate\Support\Str;

class NewsletterSubscriberObserver
{
    public function creating(NewsletterSubscriber $subscriber): void
    {
        $subscriber->token ??= Str::random(64);
    }

    public function created(NewsletterSubscriber $subscriber): void
    {
        if ($subscriber->is_active && $subscriber->consent_given) {
            dispatch(new SubscribeToNewsletterJob($subscriber->email, ['name' => $subscriber->first_name]));
        }
    }

    public function updated(NewsletterSubscriber $subscriber): void
    {
        if ($subscriber->wasChanged('is_active')) {
            if ($subscriber->is_active && $subscriber->consent_given) {
                dispatch(new SubscribeToNewsletterJob($subscriber->email, ['name' => $subscriber->first_name]));
            } elseif (! $subscriber->is_active) {
                dispatch(new UnsubscribeFromNewsletterJob($subscriber->email));
            }
        }
    }

    public function deleted(NewsletterSubscriber $subscriber): void
    {
        dispatch(new DeleteFromNewsletterJob($subscriber->email));
    }
}
