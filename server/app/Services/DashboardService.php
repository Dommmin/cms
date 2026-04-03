<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Models\Customer;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get dashboard statistics for a given date range.
     *
     * @param  array{start: Carbon, end: Carbon}  $period
     * @return array<string, mixed>
     */
    public function getStats(Carbon $start, Carbon $end): array
    {
        return [
            'revenue' => $this->getRevenue($start, $end),
            'orders_count' => $this->getOrdersCount($start, $end),
            'average_order_value' => $this->getAverageOrderValue($start, $end),
            'new_customers_count' => $this->getNewCustomersCount($start, $end),
            'top_selling_products' => $this->getTopSellingProducts($start, $end, 10),
            'recent_orders' => $this->getRecentOrders(10),
            'orders_by_status' => $this->getOrdersByStatus($start, $end),
            'revenue_by_day' => $this->getRevenueByDay($start, $end),
        ];
    }

    /**
     * Get total revenue for period.
     */
    private function getRevenue(Carbon $start, Carbon $end): int
    {
        return (int) Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', [
                OrderStatusEnum::Pending->value,
                OrderStatusEnum::Processing->value,
                OrderStatusEnum::Shipped->value,
                OrderStatusEnum::Delivered->value,
            ])
            ->sum('total');
    }

    /**
     * Get orders count for period.
     */
    private function getOrdersCount(Carbon $start, Carbon $end): int
    {
        return Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();
    }

    /**
     * Get average order value for period.
     */
    private function getAverageOrderValue(Carbon $start, Carbon $end): float
    {
        $result = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', [
                OrderStatusEnum::Pending->value,
                OrderStatusEnum::Processing->value,
                OrderStatusEnum::Shipped->value,
                OrderStatusEnum::Delivered->value,
            ])
            ->avg('total');

        return round((float) ($result ?? 0), 2);
    }

    /**
     * Get new customers count for period.
     */
    private function getNewCustomersCount(Carbon $start, Carbon $end): int
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
    private function getTopSellingProducts(Carbon $start, Carbon $end, int $limit): array
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
                OrderStatusEnum::Pending->value,
                OrderStatusEnum::Processing->value,
                OrderStatusEnum::Shipped->value,
                OrderStatusEnum::Delivered->value,
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
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'reference_number' => $order->reference_number,
                'status' => $order->status->value,
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
    private function getOrdersByStatus(Carbon $start, Carbon $end): array
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
    private function getRevenueByDay(Carbon $start, Carbon $end): array
    {
        $results = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', [
                OrderStatusEnum::Pending->value,
                OrderStatusEnum::Processing->value,
                OrderStatusEnum::Shipped->value,
                OrderStatusEnum::Delivered::value,
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
