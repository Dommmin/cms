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
            ->when($request->search, function ($query, string $search): void {
                $query->where('name', 'like', sprintf('%%%s%%', $search))
                    ->orWhereHas('customer', function ($q) use ($search): void {
                        $q->where('first_name', 'like', sprintf('%%%s%%', $search))
                            ->orWhere('last_name', 'like', sprintf('%%%s%%', $search))
                            ->orWhere('email', 'like', sprintf('%%%s%%', $search));
                    });
            })
            ->when($request->has('is_public'), function ($query) use ($request): void {
                $query->where('is_public', $request->boolean('is_public'));
            })->latest()
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
