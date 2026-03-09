<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\WidgetSize;
use App\Enums\WidgetType;
use App\Models\DashboardWidget;
use Illuminate\Database\Seeder;

class DashboardWidgetSeeder extends Seeder
{
    public function run(): void
    {
        $widgets = [
            [
                'title' => 'Total Products',
                'type' => WidgetType::Stat,
                'size' => WidgetSize::Small,
                'order' => 1,
                'is_active' => true,
                'icon' => 'package',
                'color' => 'blue',
                'config' => [
                    'model' => 'Product',
                    'query' => 'count',
                    'trend' => true,
                    'comparison_period' => 'last_month',
                ],
            ],
            [
                'title' => 'Total Orders',
                'type' => WidgetType::Stat,
                'size' => WidgetSize::Small,
                'order' => 2,
                'is_active' => true,
                'icon' => 'shopping-cart',
                'color' => 'green',
                'config' => [
                    'model' => 'Order',
                    'query' => 'count',
                    'trend' => true,
                    'comparison_period' => 'last_month',
                ],
            ],
            [
                'title' => 'Revenue',
                'type' => WidgetType::Stat,
                'size' => WidgetSize::Small,
                'order' => 3,
                'is_active' => true,
                'icon' => 'dollar-sign',
                'color' => 'purple',
                'config' => [
                    'model' => 'Order',
                    'query' => 'sum',
                    'field' => 'total',
                    'format' => 'currency',
                    'trend' => true,
                    'comparison_period' => 'last_month',
                ],
            ],
            [
                'title' => 'Total Customers',
                'type' => WidgetType::Stat,
                'size' => WidgetSize::Small,
                'order' => 4,
                'is_active' => true,
                'icon' => 'users',
                'color' => 'orange',
                'config' => [
                    'model' => 'Customer',
                    'query' => 'count',
                    'trend' => true,
                    'comparison_period' => 'last_month',
                ],
            ],
            [
                'title' => 'Sales Overview',
                'type' => WidgetType::Chart,
                'size' => WidgetSize::Medium,
                'order' => 5,
                'is_active' => true,
                'icon' => 'trending-up',
                'color' => 'blue',
                'config' => [
                    'chart_type' => 'line',
                    'model' => 'Order',
                    'field' => 'total',
                    'group_by' => 'day',
                    'period' => 'last_30_days',
                ],
            ],
            [
                'title' => 'Recent Orders',
                'type' => WidgetType::Table,
                'size' => WidgetSize::Medium,
                'order' => 6,
                'is_active' => true,
                'icon' => 'list',
                'color' => 'gray',
                'config' => [
                    'model' => 'Order',
                    'limit' => 5,
                    'order_by' => 'created_at',
                    'order_direction' => 'desc',
                    'columns' => ['id', 'customer', 'total', 'status', 'created_at'],
                ],
            ],
            [
                'title' => 'Top Products',
                'type' => WidgetType::Table,
                'size' => WidgetSize::Small,
                'order' => 7,
                'is_active' => true,
                'icon' => 'star',
                'color' => 'yellow',
                'config' => [
                    'data_source' => 'top_products',
                    'limit' => 5,
                ],
            ],
            [
                'title' => 'Orders by Status',
                'type' => WidgetType::Chart,
                'size' => WidgetSize::Small,
                'order' => 8,
                'is_active' => true,
                'icon' => 'pie-chart',
                'color' => 'blue',
                'config' => [
                    'chart_type' => 'donut',
                ],
            ],
            [
                'title' => 'Low Stock Alert',
                'type' => WidgetType::Table,
                'size' => WidgetSize::Small,
                'order' => 9,
                'is_active' => true,
                'icon' => 'alert-triangle',
                'color' => 'orange',
                'config' => [
                    'data_source' => 'low_stock',
                    'threshold' => 5,
                ],
            ],
            [
                'title' => 'Recent Reviews',
                'type' => WidgetType::Table,
                'size' => WidgetSize::Medium,
                'order' => 10,
                'is_active' => true,
                'icon' => 'star',
                'color' => 'yellow',
                'config' => [
                    'data_source' => 'reviews',
                    'limit' => 5,
                ],
            ],
            [
                'title' => 'Quick Actions',
                'type' => WidgetType::QuickActions,
                'size' => WidgetSize::Small,
                'order' => 11,
                'is_active' => true,
                'icon' => 'zap',
                'color' => 'indigo',
                'config' => [
                    'actions' => [
                        ['label' => 'New Product', 'route' => 'admin.ecommerce.products.create', 'icon' => 'plus'],
                        ['label' => 'New Order', 'route' => 'admin.ecommerce.orders.create', 'icon' => 'shopping-cart'],
                        ['label' => 'New Customer', 'route' => 'admin.ecommerce.customers.create', 'icon' => 'user-plus'],
                        ['label' => 'View Reports', 'route' => 'admin.reports', 'icon' => 'bar-chart'],
                    ],
                ],
            ],
        ];

        foreach ($widgets as $widget) {
            DashboardWidget::updateOrCreate(
                ['title' => $widget['title'], 'type' => $widget['type']],
                $widget,
            );
        }
    }
}
