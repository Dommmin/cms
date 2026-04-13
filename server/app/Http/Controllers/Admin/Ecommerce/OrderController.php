<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Enums\OrderStatusEnum;
use App\Enums\ShipmentStatusEnum;
use App\Exports\OrdersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\BulkUpdateOrderStatusRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Queries\Admin\OrderIndexQuery;
use App\Services\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\ModelStates\Exceptions\CouldNotPerformTransition;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orderQuery = new OrderIndexQuery($request);
        $orders = $orderQuery->execute();

        return inertia('admin/ecommerce/orders/index', ['orders' => $orders]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'items.variant.product',
            'customer.user',
            'billingAddress',
            'shippingAddress',
            'payment',
            'shipment.shippingMethod',
            'statusHistory',
        ]);

        return inertia('admin/ecommerce/orders/show', [
            'order' => $order,
            'statuses' => collect(OrderStatusEnum::cases())->map(fn ($s): array => [
                'value' => $s->value,
                'label' => $s->getLabel(),
                'color' => $s->getColor(),
            ]),
        ]);
    }

    public function invoice(Order $order, InvoiceService $invoiceService): HttpResponse
    {
        return $invoiceService->download($order);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filename = 'orders-'.now()->format('Y-m-d').'.xlsx';

        return Excel::download(new OrdersExport($request), $filename);
    }

    public function bulkUpdateStatus(BulkUpdateOrderStatusRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $newStatus = OrderStatusEnum::from($data['status']);

        $updated = 0;

        Order::query()
            ->whereIn('id', $data['ids'])
            ->get()
            ->each(function (Order $order) use ($newStatus, &$updated): void {
                rescue(function () use ($order, $newStatus, &$updated): void {
                    $order->changeStatus($newStatus, changedBy: 'admin', notes: 'Bulk status update');
                    $updated++;
                }, fn (): null => null);
            });

        return back()->with('success', $updated.' orders updated.');
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        $data = $request->validated();
        $newStatus = OrderStatusEnum::from($data['status']);

        try {
            $order->changeStatus(
                $newStatus,
                changedBy: 'admin',
                notes: $data['notes'] ?? null,
            );
        } catch (CouldNotPerformTransition) {
            return back()->with('error', 'Ta zmiana statusu nie jest dozwolona dla bieżącego statusu zamówienia.');
        }

        // If SHIPPED and tracking number provided — update shipment
        if ($newStatus === OrderStatusEnum::SHIPPED && (! empty($data['tracking_number']) || ! empty($data['tracking_url']))) {
            $order->shipment?->update([
                'tracking_number' => $data['tracking_number'] ?? null,
                'tracking_url' => $data['tracking_url'] ?? null,
                'status' => ShipmentStatusEnum::IN_TRANSIT,
            ]);
        }

        return back()->with('success', 'Status zamówienia został zaktualizowany.');
    }
}
