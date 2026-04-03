<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_if(! $request->user() || ! $request->user()->hasRole(['super-admin', 'admin', 'manager', 'editor', 'support', 'viewer']), 404);

        return $next($request);
    }
}
