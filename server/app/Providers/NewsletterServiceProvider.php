<?php

declare(strict_types=1);

namespace App\Providers;

use App\Infrastructure\Newsletter\KlaviyoProvider;
use App\Infrastructure\Newsletter\MailchimpProvider;
use App\Infrastructure\Newsletter\MailerLiteProvider;
use App\Infrastructure\Newsletter\NewsletterProvider;
use App\Models\NewsletterClick;
use App\Models\NewsletterSubscriber;
use App\Models\Setting;
use App\Observers\NewsletterClickObserver;
use App\Observers\NewsletterSubscriberObserver;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Throwable;

class NewsletterServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(NewsletterProvider::class, function (): NewsletterProvider {
            try {
                $provider = (string) Setting::get('newsletter', 'newsletter_provider', 'mailerlite');
            } catch (Throwable) {
                // Fallback during early migrations or install
                $provider = 'mailerlite';
            }

            return match ($provider) {
                'mailchimp' => new MailchimpProvider(
                    apiKey: (string) Setting::get('newsletter', 'mailchimp_api_key', ''),
                    listId: (string) Setting::get('newsletter', 'mailchimp_list_id', '')
                ),
                'klaviyo' => new KlaviyoProvider(
                    apiKey: (string) Setting::get('newsletter', 'klaviyo_api_key', ''),
                    listId: (string) Setting::get('newsletter', 'klaviyo_list_id', '')
                ),
                default => new MailerLiteProvider(
                    apiKey: (string) config('services.mailerlite.api_key', ''),
                    groupId: (string) config('services.mailerlite.group_id', '')
                ),
            };
        });
    }

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
