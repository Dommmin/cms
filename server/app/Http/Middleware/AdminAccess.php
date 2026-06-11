<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAccess
{
    /**
     * @var array<int, string>
     */
    private const array ALLOWED_ROLES = ['super-admin', 'admin', 'manager', 'editor', 'support', 'viewer'];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (app()->isLocal()) {
            if (! $user instanceof User) {
                $user = User::query()->where('email', 'admin@example.com')->first();

                if ($user instanceof User) {
                    auth()->login($user);
                    $request->setUserResolver(static fn (): User => $user);
                }
            }

            if ($user instanceof User) {
                abort_unless($user->hasAnyRole(self::ALLOWED_ROLES), 403);

                return $next($request);
            }
        }

        if (! $user instanceof User) {
            return redirect()->guest(route('login'));
        }

        abort_unless($user->hasAnyRole(self::ALLOWED_ROLES), 403);

        if (! $user->hasEnabledTwoFactorAuthentication()) {
            if (app()->runningUnitTests() && ! config('auth.test_require_two_factor')) {
                return $next($request);
            }

            return $this->redirectToTwoFactorSetup();
        }

        return $next($request);
    }

    private function redirectToTwoFactorSetup(): RedirectResponse
    {
        return to_route('two-factor.show')
            ->with('status', __('Two-factor authentication is required to access the admin panel.'));
    }
}
