<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\CustomReport;
use App\Services\CustomReportBuilderService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

final class CustomReportExport implements FromCollection, ShouldAutoSize, WithHeadings, WithTitle
{
    private array $reportData;

    public function __construct(
        private readonly CustomReport $report,
        private readonly CustomReportBuilderService $builderService,
    ) {
        $this->reportData = $this->builderService->build($this->report);
    }

    public function collection(): Collection
    {
        $rows = $this->reportData['data'] ?? [];

        if (empty($rows)) {
            return collect();
        }

        return collect($rows)->map(fn (array $row): array => array_values($row));
    }

    /** @return string[] */
    public function headings(): array
    {
        $columns = $this->reportData['columns'] ?? [];

        if (empty($columns)) {
            $rows = $this->reportData['data'] ?? [];
            if (! empty($rows)) {
                $columns = array_keys($rows[0]);
            }
        }

        return array_map(
            fn (string $col): string => ucwords(str_replace('_', ' ', $col)),
            $columns,
        );
    }

    public function title(): string
    {
        return mb_substr($this->report->name, 0, 31);
    }
}
