<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\Hooks\HookManager;
use Illuminate\Support\ServiceProvider;

final class HookServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('hook.manager', fn ($app): HookManager => new HookManager($app));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Hook system bootstrap points can go here if needed.
    }
}
