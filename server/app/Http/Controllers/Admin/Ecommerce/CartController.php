<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request): Response
    {
        $carts = Cart::query()
            ->with(['customer:id,first_name,last_name,email', 'items.variant.product'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('customer', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->has('is_empty'), function ($query) use ($request) {
                if ($request->boolean('is_empty')) {
                    $query->whereDoesntHave('items');
                } else {
                    $query->has('items');
                }
            })
            ->orderByDesc('updated_at')
            ->paginate(20)
            ->withQueryString();

        return inertia('admin/ecommerce/carts/index', [
            'carts' => $carts,
            'filters' => $request->only(['search', 'is_empty']),
        ]);
    }

    public function show(Cart $cart): Response
    {
        $cart->load(['customer', 'items.variant.product']);

        $stats = [
            'subtotal' => $cart->subtotal(),
            'item_count' => $cart->itemCount(),
        ];

        return inertia('admin/ecommerce/carts/show', [
            'cart' => $cart,
            'stats' => $stats,
        ]);
    }
}
