<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        $wishlists = Wishlist::query()
            ->with(['customer:id,first_name,last_name,email', 'items.product'])
            ->withCount('items')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($request->has('is_public'), function ($query) use ($request) {
                $query->where('is_public', $request->boolean('is_public'));
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return inertia('admin/ecommerce/wishlists/index', [
            'wishlists' => $wishlists,
            'filters' => $request->only(['search', 'is_public']),
        ]);
    }

    public function show(Wishlist $wishlist): Response
    {
        $wishlist->load(['customer', 'items.product']);

        return inertia('admin/ecommerce/wishlists/show', [
            'wishlist' => $wishlist,
        ]);
    }
}
