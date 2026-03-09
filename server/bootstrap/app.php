<?php

declare(strict_types=1);

use App\Http\Middleware\AdminAccess;
use App\Http\Middleware\EnsureEmailVerified;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LogApiRequests;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(append: [
            ForceJsonResponse::class,
            LogApiRequests::class,
            SetLocale::class,
        ]);

        $middleware->alias([
            'admin' => AdminAccess::class,
            'role' => Spatie\Permission\Middleware\RoleMiddleware::class,
            'force.json' => ForceJsonResponse::class,
            'log.api' => LogApiRequests::class,
            'verified' => EnsureEmailVerified::class,
            'idempotent' => Grazulex\ApiIdempotency\Http\Middleware\IdempotentMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
