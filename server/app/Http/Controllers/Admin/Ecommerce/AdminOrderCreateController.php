<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Services\AdminDraftOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class AdminOrderCreateController extends Controller
{
    public function __construct(private readonly AdminDraftOrderService $service) {}

    /**
     * Show the create-order form.
     * Loads customers + searchable products for the selector.
     */
    public function create(Request $request): Response
    {
        $customers = Customer::query()
            ->with('user:id,name,email')
            ->when($request->filled('customer_search'), function ($q) use ($request): void {
                $search = $request->input('customer_search');
                $q->where(function ($q) use ($search): void {
                    $q->where('first_name', 'like', '%'.$search.'%')
                        ->orWhere('last_name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('first_name')
            ->limit(50)
            ->get(['id', 'first_name', 'last_name', 'email']);

        return inertia('admin/ecommerce/orders/create-draft', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a new draft order.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = $this->service->createDraft($validated);

        return to_route('admin.ecommerce.orders.show', $order)
            ->with('success', 'Draft order created. Review and confirm when ready.');
    }

    /**
     * Search products/variants for the order form (AJAX).
     */
    public function searchVariants(Request $request): JsonResponse
    {
        $q = $request->input('q', '');

        $variants = ProductVariant::query()
            ->with('product:id,name')
            ->where(function ($query) use ($q): void {
                $query->where('sku', 'like', sprintf('%%%s%%', $q))
                    ->orWhereHas('product', fn ($p) => $p->where('name', 'like', sprintf('%%%s%%', $q)));
            })
            ->where('is_active', true)
            ->limit(20)
            ->get(['id', 'product_id', 'sku', 'name', 'price', 'stock_quantity'])
            ->map(fn ($v): array => [
                'id' => $v->id,
                'sku' => $v->sku,
                'name' => $v->product->name.($v->name ? ' — '.$v->name : ''),
                'price' => $v->price,
                'stock_quantity' => $v->stock_quantity,
            ]);

        return response()->json($variants);
    }

    /**
     * Confirm a draft → pending.
     */
    public function confirm(Order $order): RedirectResponse
    {
        $this->service->confirmDraft($order);

        return to_route('admin.ecommerce.orders.show', $order)
            ->with('success', 'Order confirmed and sent to processing.');
    }
}
