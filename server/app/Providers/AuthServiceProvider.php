<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Page;
use App\Models\ReturnRequest;
use App\Models\User;
use App\Policies\PagePolicy;
use App\Policies\ReturnPolicy;
use App\Policies\RolePolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;

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
        ReturnRequest::class => ReturnPolicy::class,
        Role::class => RolePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(fn (User $user, string $ability): ?bool => $user->hasRole('super-admin') ? true : null);
    }
}
