<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Date;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsReportService $service) {}

    public function conversion(Request $request): Response
    {
        $period = $this->resolvePeriod($request);

        return inertia('admin/analytics/conversion', [
            'data' => $this->service->conversionFunnel($period),
            'filters' => ['from' => $period['start']->toDateString(), 'to' => $period['end']->toDateString()],
        ]);
    }

    public function customers(Request $request): Response
    {
        $period = $this->resolvePeriod($request);

        return inertia('admin/analytics/customers', [
            'data' => $this->service->customerReport($period),
            'filters' => ['from' => $period['start']->toDateString(), 'to' => $period['end']->toDateString()],
        ]);
    }

    public function inventory(): Response
    {
        return inertia('admin/analytics/inventory', [
            'data' => $this->service->inventoryReport(),
        ]);
    }

    public function vat(Request $request): Response
    {
        $period = $this->resolvePeriod($request);

        return inertia('admin/analytics/vat', [
            'data' => $this->service->vatReport($period),
            'filters' => ['from' => $period['start']->toDateString(), 'to' => $period['end']->toDateString()],
        ]);
    }

    public function jpkExport(Request $request): HttpResponse
    {
        $month = $request->filled('month')
            ? Date::parse($request->month)->startOfMonth()
            : now()->subMonth()->startOfMonth();

        $xml = $this->service->generateJpkV7Xml($month);

        $filename = sprintf('JPK_V7M_%s.xml', $month->format('Y-m'));

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $filename),
        ]);
    }

    /**
     * @return array{start: Carbon, end: Carbon}
     */
    private function resolvePeriod(Request $request): array
    {
        $from = $request->filled('from') ? Date::parse($request->from)->startOfDay() : now()->subDays(29)->startOfDay();
        $to = $request->filled('to') ? Date::parse($request->to)->endOfDay() : now()->endOfDay();

        return ['start' => $from, 'end' => $to];
    }
}
