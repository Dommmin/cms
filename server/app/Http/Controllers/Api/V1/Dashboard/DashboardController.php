<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Api\ApiController;
use App\Services\DashboardService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

class DashboardController extends ApiController
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    /**
     * Get dashboard statistics.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date')
            ? Date::parse($request->input('start_date'))->startOfDay()
            : now()->subDays(30)->startOfDay();

        $endDate = $request->input('end_date')
            ? Date::parse($request->input('end_date'))->endOfDay()
            : now()->endOfDay();

        /** @var array{start: Carbon, end: Carbon} $period */
        $period = ['start' => $startDate, 'end' => $endDate];

        $stats = $this->dashboardService->getStats($period);

        return $this->ok($stats);
    }
}
