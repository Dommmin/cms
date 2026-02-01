<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReturnRequest;
use App\Modules\Ecommerce\Domain\Models\Order;
use App\Modules\Ecommerce\Domain\Models\ReturnRequest;
use App\Modules\Ecommerce\Domain\Models\ReturnItem;
use Illuminate\Http\JsonResponse;

/**
 * Return Controller
 * Moved to Ecommerce module
 */
final class ReturnController extends Controller
{
    /** GET /api/returns */
    public function index(): JsonResponse
    {
        $customer = auth()->user()->customer;

        $returns = ReturnRequest::whereHas('order', fn($q) => $q->where('customer_id', $customer->id))
            ->with('items.orderItem', 'order', 'statusHistory')
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($returns);
    }

    /** POST /api/returns */
    public function store(StoreReturnRequest $request): JsonResponse
    {
        $this->authorize('create', ReturnRequest::class);
        $return = ReturnRequest::create([
            'order_id'         => $request->order_id,
            'reference_number' => ReturnRequest::generateReferenceNumber(),
            'return_type'      => $request->return_type,
            'status'           => 'pending',
            'reason'           => $request->reason,
            'customer_notes'   => $request->customer_notes,
        ]);

        foreach ($request->items as $item) {
            ReturnItem::create([
                'return_id'      => $return->id,
                'order_item_id'  => $item['order_item_id'],
                'quantity'       => $item['quantity'],
                'condition'      => $item['condition'] ?? null,
                'notes'          => $item['notes'] ?? null,
            ]);
        }

        $return->load('items', 'order');

        return response()->json($return, 201);
    }
}

