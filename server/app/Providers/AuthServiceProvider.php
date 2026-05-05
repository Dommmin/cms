<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Page;
use App\Models\User;
use App\Policies\PagePolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Page::class => PagePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
