<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Models\BlogPost;
use App\Models\Customer;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Order;
use App\Models\Page;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get dashboard statistics for a given date range.
     *
     * @param  array{start: Carbon, end: Carbon}  $period
     * @return array<string, mixed>
     */
    public function getStats(array $period): array
    {
        $start = $period['start'];
        $end = $period['end'];

        $stats = [
            'cms' => $this->getCmsStats($start, $end),
        ];

        if (config('modules.ecommerce')) {
            $stats['revenue'] = $this->getRevenue($start, $end);
            $stats['orders_count'] = $this->getOrdersCount($start, $end);
            $stats['average_order_value'] = $this->getAverageOrderValue($start, $end);
            $stats['new_customers_count'] = $this->getNewCustomersCount($start, $end);
            $stats['top_selling_products'] = $this->getTopSellingProducts($start, $end, 10);
            $stats['recent_orders'] = $this->getRecentOrders(10);
            $stats['orders_by_status'] = $this->getOrdersByStatus($start, $end);
            $stats['revenue_by_day'] = $this->getRevenueByDay($start, $end);
        }

        return $stats;
    }

    /**
     * Get CMS-level statistics (available regardless of ecommerce module).
     *
     * @return array<string, int>
     */
    private function getCmsStats(CarbonInterface $start, CarbonInterface $end): array
    {
        return [
            'published_pages' => Page::query()->where('status', 'published')->count(),
            'published_posts' => BlogPost::query()->where('status', 'published')->count(),
            'new_form_submissions' => FormSubmission::query()
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            'active_forms' => Form::query()->where('is_active', true)->count(),
        ];
    }

    /**
     * Get total revenue for period.
     */
    private function getRevenue(CarbonInterface $start, CarbonInterface $end): int
    {
        return (int) Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', [
                OrderStatusEnum::PENDING->value,
                OrderStatusEnum::PROCESSING->value,
                OrderStatusEnum::SHIPPED->value,
                OrderStatusEnum::DELIVERED->value,
            ])
            ->sum('total');
    }

    /**
     * Get orders count for period.
     */
    private function getOrdersCount(CarbonInterface $start, CarbonInterface $end): int
    {
        return Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();
    }

    /**
     * Get average order value for period.
     */
    private function getAverageOrderValue(CarbonInterface $start, CarbonInterface $end): float
    {
        $result = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', [
                OrderStatusEnum::PENDING->value,
                OrderStatusEnum::PROCESSING->value,
                OrderStatusEnum::SHIPPED->value,
                OrderStatusEnum::DELIVERED->value,
            ])
            ->avg('total');

        return round((float) ($result ?? 0), 2);
    }

    /**
     * Get new customers count for period.
     */
    private function getNewCustomersCount(CarbonInterface $start, CarbonInterface $end): int
    {
        return Customer::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();
    }

    /**
     * Get top selling products for period.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getTopSellingProducts(CarbonInterface $start, CarbonInterface $end, int $limit): array
    {
        $results = DB::query()
            ->select([
                'product_variants.product_id',
                'products.name',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.subtotal) as total_revenue'),
            ])
            ->from('order_items')
            ->join('product_variants', 'order_items.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereIn('orders.status', [
                OrderStatusEnum::PENDING->value,
                OrderStatusEnum::PROCESSING->value,
                OrderStatusEnum::SHIPPED->value,
                OrderStatusEnum::DELIVERED->value,
            ])
            ->groupBy('product_variants.product_id', 'products.name')
            ->orderByDesc('total_quantity')
            ->limit($limit)
            ->get();

        return $results->map(fn ($item): array => [
            'product_id' => $item->product_id,
            'name' => $item->name,
            'total_quantity' => (int) $item->total_quantity,
            'total_revenue' => (int) $item->total_revenue,
        ])->all();
    }

    /**
     * Get recent orders.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getRecentOrders(int $limit): array
    {
        return Order::query()
            ->with(['customer', 'items'])->latest()
            ->limit($limit)
            ->get()
            ->map(/** @phpstan-ignore argument.type */ fn (Order $order): array => [
                'id' => $order->id,
                'reference_number' => $order->reference_number,
                'status' => $order->status->getValue(),
                'total' => $order->total,
                'items_count' => $order->items->count(),
                'customer_name' => $order->customer?->name,
                'created_at' => $order->created_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * Get orders by status for period.
     *
     * @return array<string, int>
     */
    private function getOrdersByStatus(CarbonInterface $start, CarbonInterface $end): array
    {
        $results = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        $statusCounts = [];
        foreach (OrderStatusEnum::cases() as $status) {
            $statusCounts[$status->value] = 0;
        }

        foreach ($results as $result) {
            $statusCounts[$result->status] = (int) $result->count;
        }

        return $statusCounts;
    }

    /**
     * Get revenue by day for period.
     *
     * @return array<string, int>
     */
    private function getRevenueByDay(CarbonInterface $start, CarbonInterface $end): array
    {
        $results = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', [
                OrderStatusEnum::PENDING->value,
                OrderStatusEnum::PROCESSING->value,
                OrderStatusEnum::SHIPPED->value,
                OrderStatusEnum::DELIVERED->value,
            ])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $revenueByDay = [];
        $current = $start->copy()->startOfDay();
        $end = $end->copy()->endOfDay();

        while ($current->lte($end)) {
            $revenueByDay[$current->toDateString()] = 0;
            $current->addDay();
        }

        foreach ($results as $result) {
            $revenueByDay[$result->date] = (int) $result->revenue;
        }

        return $revenueByDay;
    }
}
