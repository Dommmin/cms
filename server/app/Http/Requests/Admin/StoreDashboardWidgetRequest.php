<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\WidgetSize;
use App\Enums\WidgetType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDashboardWidgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:100'],
            'type' => ['required', Rule::enum(WidgetType::class)],
            'size' => ['required', Rule::enum(WidgetSize::class)],
            'icon' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:30'],

            // Stat
            'stat_model' => ['required_if:type,stat', 'nullable', Rule::in(['Product', 'Order', 'Customer'])],
            'stat_query' => ['required_if:type,stat', 'nullable', Rule::in(['count', 'sum', 'avg'])],
            'stat_field' => ['nullable', 'string', 'max:50'],
            'stat_format' => ['nullable', Rule::in(['number', 'currency'])],
            'stat_trend' => ['boolean'],
            'stat_period' => ['nullable', Rule::in(['last_month', 'last_week'])],

            // Chart
            'chart_type' => ['required_if:type,chart', 'nullable', Rule::in(['line', 'donut'])],

            // Table
            'table_source' => ['nullable', Rule::in(['top_products', 'low_stock', 'reviews', 'model'])],
            'table_model' => ['nullable', Rule::in(['Order', 'Product'])],
            'table_limit' => ['nullable', 'integer', 'min:1', 'max:50'],
            'table_threshold' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /** Build the JSON config array from flat form fields. */
    public function buildConfig(): array
    {
        return match ($this->string('type')->toString()) {
            'stat' => array_filter([
                'model' => $this->stat_model,
                'query' => $this->stat_query,
                'field' => $this->stat_field ?: null,
                'format' => $this->stat_format ?? 'number',
                'trend' => (bool) $this->stat_trend,
                'comparison_period' => $this->stat_period ?? 'last_month',
            ], fn ($v) => $v !== null && $v !== false),

            'chart' => $this->chart_type === 'donut'
                ? ['chart_type' => 'donut']
                : ['chart_type' => 'line', 'model' => 'Order', 'field' => 'total', 'group_by' => 'day'],

            'table' => match ($this->table_source) {
                'top_products' => ['data_source' => 'top_products', 'limit' => (int) ($this->table_limit ?? 5)],
                'low_stock' => ['data_source' => 'low_stock', 'threshold' => (int) ($this->table_threshold ?? 5)],
                'reviews' => ['data_source' => 'reviews', 'limit' => (int) ($this->table_limit ?? 5)],
                default => [
                    'model' => $this->table_model ?? 'Order',
                    'limit' => (int) ($this->table_limit ?? 5),
                    'order_by' => 'created_at',
                    'order_direction' => 'desc',
                    'columns' => $this->table_model === 'Product'
                        ? ['id', 'name', 'status', 'created_at']
                        : ['id', 'customer', 'total', 'status', 'created_at'],
                ],
            },

            'quick_actions' => ['actions' => []],

            default => [],
        };
    }
}
