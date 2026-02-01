<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Domain\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Order Controller
 * Moved to Ecommerce module
 */
final class OrderController extends Controller
{
    /**
     * GET /api/orders - current user orders
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('customer_id', auth()->user()->customer->id)
            ->with('items', 'payment', 'shipment', 'statusHistory')
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 10);

        return response()->json($orders);
    }

    /**
     * GET /api/orders/{order}
     */
    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $order->load([
            'items.variant.product',
            'billingAddress',
            'shippingAddress',
            'payment',
            'shipment',
            'statusHistory',
        ]);

        return response()->json($order);
    }
}

