<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\NewsletterClick;
use App\Models\NewsletterSubscriber;
use App\Observers\NewsletterClickObserver;
use App\Observers\NewsletterSubscriberObserver;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class NewsletterServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap newsletter observers and routes.
     */
    public function boot(): void
    {
        $this->registerObservers();
        $this->loadRoutes();
    }

    protected function registerObservers(): void
    {
        NewsletterSubscriber::observe(NewsletterSubscriberObserver::class);
        NewsletterClick::observe(NewsletterClickObserver::class);
    }

    protected function loadRoutes(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api/newsletter.php'));
    }
}
