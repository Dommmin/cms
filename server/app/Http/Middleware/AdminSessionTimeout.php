<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

final class AdminSessionTimeout
{
    /**
     * Shorter session timeout for admin users (in minutes).
     * Default: 30 minutes (vs 120 minutes for regular users).
     */
    private const int ADMIN_TIMEOUT_MINUTES = 30;

    private const string SESSION_LAST_ACTIVITY_KEY = 'admin_last_activity';

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return $next($request);
        }

        // Only apply to admin routes
        if (! $request->is('admin*')) {
            return $next($request);
        }

        $now = now()->timestamp;
        $lastActivity = $request->session()->get(self::SESSION_LAST_ACTIVITY_KEY, $now);
        $timeoutSeconds = self::ADMIN_TIMEOUT_MINUTES * 60;

        // Check if session has expired for admin
        if ($lastActivity && ($now - $lastActivity) > $timeoutSeconds) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return to_route('login')->withErrors([
                'email' => __('Session expired. Please log in again.'),
            ]);
        }

        // Update last activity timestamp for admin routes
        $request->session()->put(self::SESSION_LAST_ACTIVITY_KEY, $now);

        return $next($request);
    }
}
