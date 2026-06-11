<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
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

        abort_unless($user instanceof User, 404);

        abort_unless($user->hasAnyRole(self::ALLOWED_ROLES), 403);

        if (! $user->hasEnabledTwoFactorAuthentication()) {
            return $this->redirectToTwoFactorSetup();
        }

        return $next($request);
    }

    private function redirectToTwoFactorSetup(): RedirectResponse
    {
        return redirect()
            ->route('two-factor.show')
            ->with('status', __('Two-factor authentication is required to access the admin panel.'));
    }
}
