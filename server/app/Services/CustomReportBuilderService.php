<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use App\Models\CustomReport;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;

final class CustomReportBuilderService
{
    private array $dataSources = [
        'orders' => [
            'model' => Order::class,
            'table' => 'orders',
            'fields' => ['id', 'reference_number', 'status', 'total', 'subtotal', 'shipping_cost', 'created_at', 'updated_at'],
            'relations' => ['customer', 'items'],
        ],
        'products' => [
            'model' => Product::class,
            'table' => 'products',
            'fields' => ['id', 'name', 'sku', 'price', 'stock', 'created_at'],
            'relations' => ['category', 'brand'],
        ],
        'customers' => [
            'model' => Customer::class,
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

    public function exportToCsv(CustomReport $report): string
    {
        $data = $this->build($report);

        $output = fopen('php://temp', 'r+');

        if (empty($data['data'])) {
            return '';
        }

        fputcsv($output, array_keys($data['data'][0]), escape: '\\');

        foreach ($data['data'] as $row) {
            fputcsv($output, $row, escape: '\\');
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

    private function applyFilters($query, array $filters): void
    {
        foreach ($filters as $filter) {
            $field = $filter['field'] ?? null;
            $operator = $filter['operator'] ?? '=';
            $value = $filter['value'] ?? null;
            if (! $field) {
                continue;
            }

            if ($value === null) {
                continue;
            }

            if ($field === 'date_range' && isset($value['start'], $value['end'])) {
                $query->whereBetween('created_at', [
                    Date::parse($value['start']),
                    Date::parse($value['end']),
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
                $query->addSelect(DB::raw(sprintf('DATE(%s) as %s_group', $field, $field)));
                $query->groupBy(DB::raw(sprintf('DATE(%s)', $field)));
            } elseif ($type === 'month') {
                $query->addSelect(DB::raw(sprintf("DATE_FORMAT(%s, '%%Y-%%m') as %s_group", $field, $field)));
                $query->groupBy(DB::raw(sprintf("DATE_FORMAT(%s, '%%Y-%%m')", $field)));
            } elseif ($type === 'week') {
                $query->addSelect(DB::raw(sprintf('YEARWEEK(%s, 1) as %s_group', $field, $field)));
                $query->groupBy(DB::raw(sprintf('YEARWEEK(%s, 1)', $field)));
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

            $fields[] = sprintf('%s(%s.%s) as %s', $aggregate, $table, $field, $metric);
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
}
