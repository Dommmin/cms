<?php

declare(strict_types=1);

namespace App\Providers;

use App\Shared\Kernel\Events\EventBus;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Events\Dispatcher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register Event Bus as singleton
        $this->app->singleton(EventBus::class, function ($app) {
            return new EventBus($app->make(Dispatcher::class));
        });

        // Register AI Service (can be switched to Anthropic later)
        $this->app->singleton(
            \App\Modules\AI\Domain\Interfaces\AIServiceInterface::class,
            function ($app) {
                $apiKey = config('services.openai.key');
                if ($apiKey) {
                    return new \App\Modules\AI\Infrastructure\External\OpenAIService($apiKey);
                }
                // Return stub if no API key
                return new \App\Modules\AI\Infrastructure\External\OpenAIService('');
            }
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();

        if (App::environment('local')) {
            Model::shouldBeStrict();
        }

        if (App::environment('production', 'staging')) {
            URL::forceScheme('https');
        }
    }

    /**
     * Configure the rate limiters for the application.
     */
    private function configureRateLimiting(): void
    {
        // Default API rate limiter - 60 requests per minute
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()));

        // Auth endpoints - more restrictive (prevent brute force)
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));

        // Authenticated user requests - higher limit
        RateLimiter::for('authenticated', fn (Request $request) => $request->user()
            ? Limit::perMinute(120)->by($request->user()->id)
            : Limit::perMinute(60)->by($request->ip()));
    }
}
