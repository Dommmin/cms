<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Models\CustomReport;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

final class CustomReportBuilderService
{
    private array $dataSources = [
        'orders' => [
            'model' => \App\Models\Order::class,
            'table' => 'orders',
            'fields' => ['id', 'reference_number', 'status', 'total', 'subtotal', 'shipping_cost', 'created_at', 'updated_at'],
            'relations' => ['customer', 'items'],
        ],
        'products' => [
            'model' => \App\Models\Product::class,
            'table' => 'products',
            'fields' => ['id', 'name', 'sku', 'price', 'stock', 'created_at'],
            'relations' => ['category', 'brand'],
        ],
        'customers' => [
            'model' => \App\Models\Customer::class,
            'table' => 'customers',
            'fields' => ['id', 'first_name', 'last_name', 'email', 'created_at'],
            'relations' => ['user'],
        ],
    ];

    private array $metricAggregates = [
        'revenue' => ['field' => 'total', 'aggregate' => 'SUM'],
        'count' => ['field' => 'id', 'aggregate' => 'COUNT'],
        'average' => ['field' => 'total', 'aggregate' => 'AVG'],
        'quantity' => ['field' => 'quantity', 'aggregate' => 'SUM', 'table' => 'order_items'],
    ];

    public function build(CustomReport $report): array
    {
        $dataSource = $this->dataSources[$report->data_source] ?? null;

        if (! $dataSource) {
            return [];
        }

        $query = $dataSource['model']::query();

        $this->applyFilters($query, $report->filters ?? []);
        $this->applyDimensions($query, $report->dimensions ?? []);
        $this->applyGroupBy($query, $report->group_by ?? []);

        $selectFields = $this->buildSelectFields($report, $dataSource);
        $query->selectRaw($selectFields);

        $results = $query->get();

        return $this->formatResults($results, $report);
    }

    private function applyFilters($query, array $filters): void
    {
        foreach ($filters as $filter) {
            $field = $filter['field'] ?? null;
            $operator = $filter['operator'] ?? '=';
            $value = $filter['value'] ?? null;

            if (! $field || $value === null) {
                continue;
            }

            if ($field === 'date_range' && isset($value['start'], $value['end'])) {
                $query->whereBetween('created_at', [
                    Carbon::parse($value['start']),
                    Carbon::parse($value['end']),
                ]);
                continue;
            }

            if ($operator === 'in') {
                $query->whereIn($field, (array) $value);
            } elseif ($operator === 'not_in') {
                $query->whereNotIn($field, (array) $value);
            } elseif ($operator === 'like') {
                $query->where($field, 'like', '%'.$value.'%');
            } else {
                $query->where($field, $operator, $value);
            }
        }
    }

    private function applyDimensions($query, array $dimensions): void
    {
        foreach ($dimensions as $dimension) {
            if (isset($dimension['relation'])) {
                $query->with($dimension['relation']);
            }
        }
    }

    private function applyGroupBy($query, array $groupBy): void
    {
        foreach ($groupBy as $group) {
            $field = $group['field'] ?? null;
            $type = $group['type'] ?? null;

            if (! $field) {
                continue;
            }

            if ($type === 'date') {
                $query->addSelect(DB::raw("DATE($field) as {$field}_group"));
                $query->groupBy(DB::raw("DATE($field)"));
            } elseif ($type === 'month') {
                $query->addSelect(DB::raw("DATE_FORMAT($field, '%Y-%m') as {$field}_group"));
                $query->groupBy(DB::raw("DATE_FORMAT($field, '%Y-%m')"));
            } elseif ($type === 'week') {
                $query->addSelect(DB::raw("YEARWEEK($field, 1) as {$field}_group"));
                $query->groupBy(DB::raw("YEARWEEK($field, 1)"));
            } else {
                $query->addSelect($field);
                $query->groupBy($field);
            }
        }
    }

    private function buildSelectFields(CustomReport $report, array $dataSource): string
    {
        $fields = [];

        foreach ($report->metrics ?? [] as $metric) {
            $metricConfig = $this->metricAggregates[$metric] ?? null;

            if (! $metricConfig) {
                continue;
            }

            $aggregate = $metricConfig['aggregate'];
            $field = $metricConfig['field'];
            $table = $metricConfig['table'] ?? $dataSource['table'];

            $fields[] = "{$aggregate}({$table}.{$field}) as {$metric}";
        }

        foreach ($report->dimensions ?? [] as $dimension) {
            if (isset($dimension['field']) && ! isset($dimension['relation'])) {
                $fields[] = $dimension['field'];
            }
        }

        return implode(', ', $fields);
    }

    private function formatResults($results, CustomReport $report): array
    {
        return [
            'data' => $results->toArray(),
            'meta' => [
                'total' => $results->count(),
                'metrics' => $report->metrics,
                'dimensions' => $report->dimensions,
                'filters' => $report->filters,
                'chart_type' => $report->chart_type,
            ],
        ];
    }

    public function exportToCsv(CustomReport $report): string
    {
        $data = $this->build($report);

        $output = fopen('php://temp', 'r+');

        if (empty($data['data'])) {
            return '';
        }

        fputcsv($output, array_keys($data['data'][0]));

        foreach ($data['data'] as $row) {
            fputcsv($output, $row);
        }

        rewind($output);

        return stream_get_contents($output);
    }

    public function getAvailableDataSources(): array
    {
        return array_keys($this->dataSources);
    }

    public function getAvailableMetrics(): array
    {
        return array_keys($this->metricAggregates);
    }

    public function getAvailableFilters(string $dataSource): array
    {
        $config = $this->dataSources[$dataSource] ?? null;

        if (! $config) {
            return [];
        }

        $filters = [];

        foreach ($config['fields'] as $field) {
            $filters[] = [
                'field' => $field,
                'label' => ucfirst(str_replace('_', ' ', $field)),
                'operators' => ['=', '!=', '>', '<', '>=', '<=', 'like', 'in', 'not_in'],
            ];
        }

        return $filters;
    }
}