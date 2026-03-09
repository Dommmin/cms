<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\DashboardWidget;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductVariant;
use Exception;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Load all widgets (active + inactive) so the dashboard can render toggle buttons
        $widgets = DashboardWidget::ordered()->get();

        $widgetsData = $widgets->map(function ($widget) {
            return [
                'id' => $widget->id,
                'title' => $widget->title,
                'type' => $widget->type->value,
                'size' => $widget->size->value,
                'icon' => $widget->icon,
                'color' => $widget->color,
                'is_active' => $widget->is_active,
                'order' => $widget->order,
                'config' => $widget->config,
                'data' => $widget->is_active ? $this->getWidgetData($widget) : null,
            ];
        });

        return Inertia::render('admin/dashboard', [
            'widgets' => $widgetsData,
        ]);
    }

    private function getWidgetData(DashboardWidget $widget): mixed
    {
        return match ($widget->type->value) {
            'stat' => $this->getStatData($widget),
            'chart' => $this->getChartData($widget),
            'table' => $this->getTableData($widget),
            'quick_actions' => collect($widget->config['actions'] ?? [])->map(function ($action) {
                try {
                    $url = route($action['route']);
                } catch (Exception) {
                    $url = '#';
                }

                return [...$action, 'url' => $url];
            })->toArray(),
            default => null,
        };
    }

    private function getStatData(DashboardWidget $widget): array
    {
        $config = $widget->config;
        $model = $config['model'] ?? null;

        if (! $model) {
            return ['value' => 0, 'trend' => 0];
        }

        $query = match ($model) {
            'Product' => Product::query(),
            'Order' => Order::query(),
            'Customer' => Customer::query(),
            default => null,
        };

        if (! $query) {
            return ['value' => 0, 'trend' => 0];
        }

        $value = match ($config['query'] ?? 'count') {
            'count' => $query->count(),
            'sum' => $query->sum($config['field'] ?? 'id'),
            'avg' => $query->avg($config['field'] ?? 'id'),
            default => 0,
        };

        $trend = 0;
        if ($config['trend'] ?? false) {
            $period = $config['comparison_period'] ?? 'last_month';
            $previousQuery = clone $query;

            $previousValue = match ($period) {
                'last_month' => $previousQuery->whereMonth('created_at', now()->subMonth()->month)->count(),
                'last_week' => $previousQuery->whereBetween('created_at', [now()->subWeek(), now()])->count(),
                default => 0,
            };

            if ($previousValue > 0) {
                $trend = (($value - $previousValue) / $previousValue) * 100;
            }
        }

        return [
            'value' => $value,
            'trend' => round($trend, 1),
            'format' => $config['format'] ?? 'number',
        ];
    }

    private function getChartData(DashboardWidget $widget): array
    {
        $config = $widget->config;
        $chartType = $config['chart_type'] ?? 'line';

        if ($chartType === 'donut') {
            return $this->getOrdersByStatusData();
        }

        if (($config['data_source'] ?? '') === 'low_stock') {
            return $this->getLowStockData($config['threshold'] ?? 5);
        }

        // Default: 365-day revenue chart (daily granularity, frontend aggregates to weekly/monthly)
        $data = [];
        for ($i = 364; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $value = Order::whereDate('created_at', $date->toDateString())->sum('total') ?? 0;
            $data[] = [
                'date' => $date->toDateString(),
                'value' => (int) $value,
            ];
        }

        return $data;
    }

    private function getOrdersByStatusData(): array
    {
        $statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        return collect($statuses)->map(fn ($status) => [
            'label' => ucfirst($status),
            'date' => ucfirst($status),
            'value' => Order::where('status', $status)->count(),
        ])->filter(fn ($item) => $item['value'] > 0)->values()->toArray();
    }

    private function getLowStockData(int $threshold): array
    {
        return ProductVariant::query()
            ->where('stock_quantity', '<=', $threshold)
            ->where('stock_quantity', '>', 0)
            ->with('product:id,name')
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get()
            ->map(fn ($variant) => [
                'id' => $variant->id,
                'name' => $variant->product?->name ?? "Variant #{$variant->id}",
                'sku' => $variant->sku,
                'stock' => $variant->stock_quantity,
            ])
            ->toArray();
    }

    private function getTopProductsData(int $limit): array
    {
        return OrderItem::query()
            ->select('product_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(total_price) as total_revenue'))
            ->groupBy('product_name')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->product_name,
                'total_qty' => (int) $row->total_qty,
                'total_revenue' => (int) $row->total_revenue,
            ])
            ->toArray();
    }

    private function getTableData(DashboardWidget $widget): array
    {
        $config = $widget->config;

        // Special: top products by revenue
        if (($config['data_source'] ?? '') === 'top_products') {
            return $this->getTopProductsData($config['limit'] ?? 5);
        }

        // Special: recent reviews
        if (($config['data_source'] ?? '') === 'reviews') {
            return ProductReview::query()
                ->with('product:id,name')
                ->latest()
                ->limit($config['limit'] ?? 5)
                ->get()
                ->map(fn ($review) => [
                    'id' => $review->id,
                    'name' => $review->product?->name ?? '—',
                    'author' => $review->author ?? 'Anonymous',
                    'rating' => $review->rating,
                    'status' => $review->status,
                    'created_at' => $review->created_at?->diffForHumans(),
                ])
                ->toArray();
        }

        $model = $config['model'] ?? null;

        if (! $model) {
            return [];
        }

        $query = match ($model) {
            'Product' => Product::query()->with('thumbnail'),
            'Order' => Order::query()->with('customer'),
            default => null,
        };

        if (! $query) {
            return [];
        }

        return $query
            ->orderBy($config['order_by'] ?? 'created_at', $config['order_direction'] ?? 'desc')
            ->limit($config['limit'] ?? 5)
            ->get()
            ->map(function ($item) use ($config) {
                $data = ['id' => $item->id];

                foreach ($config['columns'] ?? [] as $column) {
                    $data[$column] = match ($column) {
                        'customer' => $item->customer?->name ?? 'Guest',
                        'created_at' => $item->created_at?->diffForHumans(),
                        default => $item->{$column} ?? null,
                    };
                }

                return $data;
            })
            ->toArray();
    }
}
