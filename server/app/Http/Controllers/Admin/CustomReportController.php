<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Exports\CustomReportExport;
use App\Http\Controllers\Controller;
use App\Models\CustomReport;
use App\Services\CustomReportBuilderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\LaravelPdf\Facades\Pdf;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

final class CustomReportController extends Controller
{
    public function __construct(
        private readonly CustomReportBuilderService $builder
    ) {}

    public function index(): Response
    {
        $reports = CustomReport::query()
            ->with('user')
            ->where('user_id', auth()->id())
            ->orWhere('is_public', true)
            ->latest()
            ->get();

        return Inertia::render('admin/reports/index', [
            'reports' => $reports,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/reports/create', [
            'dataSources' => $this->builder->getAvailableDataSources(),
            'metrics' => $this->builder->getAvailableMetrics(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'data_source' => ['required', 'string'],
            'metrics' => ['required', 'array'],
            'dimensions' => ['nullable', 'array'],
            'filters' => ['nullable', 'array'],
            'group_by' => ['nullable', 'array'],
            'chart_type' => ['nullable', 'string', 'in:table,line,bar,pie'],
            'is_public' => ['boolean'],
        ]);

        $report = CustomReport::query()->create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return to_route('admin.reports.show', $report)
            ->with('success', 'Report created successfully.');
    }

    public function show(CustomReport $report): Response
    {
        $report->load('user');

        $results = $this->builder->build($report);

        return Inertia::render('admin/reports/show', [
            'report' => $report,
            'results' => $results,
        ]);
    }

    public function edit(CustomReport $report): Response
    {
        return Inertia::render('admin/reports/edit', [
            'report' => $report,
            'dataSources' => $this->builder->getAvailableDataSources(),
            'metrics' => $this->builder->getAvailableMetrics(),
        ]);
    }

    public function update(Request $request, CustomReport $report): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'data_source' => ['required', 'string'],
            'metrics' => ['required', 'array'],
            'dimensions' => ['nullable', 'array'],
            'filters' => ['nullable', 'array'],
            'group_by' => ['nullable', 'array'],
            'chart_type' => ['nullable', 'string', 'in:table,line,bar,pie'],
            'is_public' => ['boolean'],
        ]);

        $report->update($validated);

        return to_route('admin.reports.show', $report)
            ->with('success', 'Report updated successfully.');
    }

    public function destroy(CustomReport $report): RedirectResponse
    {
        $report->delete();

        return to_route('admin.reports.index')
            ->with('success', 'Report deleted successfully.');
    }

    public function export(CustomReport $report): HttpResponse
    {
        $csv = $this->builder->exportToCsv($report);

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', sprintf('attachment; filename="%s.csv"', $report->name));
    }

    public function exportExcel(CustomReport $report): BinaryFileResponse
    {
        $filename = str($report->name)->slug()->append('-').now()->format('Y-m-d').'.xlsx';

        return Excel::download(
            new CustomReportExport($report, $this->builder),
            $filename,
        );
    }

    public function exportPdf(CustomReport $report): \Illuminate\Http\Response
    {
        $results = $this->builder->build($report);
        $filename = str($report->name)->slug()->append('-').now()->format('Y-m-d').'.pdf';

        return Pdf::view('pdf.report', ['report' => $report, 'results' => $results])
            ->name($filename)
            ->download()
            ->toResponse(request());
    }

    public function getFilters(string $dataSource): array
    {
        return $this->builder->getAvailableFilters($dataSource);
    }
}
