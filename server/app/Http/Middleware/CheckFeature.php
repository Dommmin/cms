<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Modules\Core\Domain\Services\FeatureFlagService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to check if feature is enabled
 * Returns 403 if feature is not available
 */
final class CheckFeature
{
    public function __construct(
        private readonly FeatureFlagService $featureFlagService
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        if (!$this->featureFlagService->hasLicense($feature)) {
            abort(403, "Feature '{$feature}' is not available. Please purchase a license.");
        }

        return $next($request);
    }
}

