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
            ->when($request->search, function ($query, $search): void {
                $query->whereHas('customer', function ($q) use ($search): void {
                    $q->where('first_name', 'like', sprintf('%%%s%%', $search))
                        ->orWhere('last_name', 'like', sprintf('%%%s%%', $search))
                        ->orWhere('email', 'like', sprintf('%%%s%%', $search));
                });
            })
            ->when($request->has('is_empty'), function ($query) use ($request): void {
                if ($request->boolean('is_empty')) {
                    $query->whereDoesntHave('items');
                } else {
                    $query->has('items');
                }
            })
            ->latest('updated_at')
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
