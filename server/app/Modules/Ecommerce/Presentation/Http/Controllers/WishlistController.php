<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Domain\Models\Wishlist;
use App\Modules\Ecommerce\Domain\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Wishlist Controller
 * Moved to Ecommerce module
 */
final class WishlistController extends Controller
{
    /** GET /api/wishlists */
    public function index(): JsonResponse
    {
        $customer   = auth()->user()->customer;
        $wishlists  = $customer->wishlists()->with('items.variant.product')->get();

        return response()->json($wishlists);
    }

    /** POST /api/wishlists */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Wishlist::class);
        $request->validate([
            'name'      => ['required', 'string', 'min:1', 'max:100'],
            'is_public' => ['boolean'],
        ]);

        $wishlist = Wishlist::create([
            'customer_id' => auth()->user()->customer->id,
            'name'        => $request->name,
            'is_public'   => $request->is_public ?? false,
        ]);

        return response()->json($wishlist, 201);
    }

    /** POST /api/wishlists/{wishlist}/items */
    public function addItem(Request $request, Wishlist $wishlist): JsonResponse
    {
        $this->authorize('update', $wishlist);
        $request->validate([
            'variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'notes'      => ['nullable', 'string', 'max:500'],
        ]);

        $item = WishlistItem::updateOrCreate(
            ['wishlist_id' => $wishlist->id, 'variant_id' => $request->variant_id],
            ['notes' => $request->notes]
        );

        $wishlist->load('items.variant.product');

        return response()->json($wishlist);
    }

    /** DELETE /api/wishlists/{wishlist}/items/{wishlistItem} */
    public function removeItem(Wishlist $wishlist, WishlistItem $wishlistItem): JsonResponse
    {
        $this->authorize('update', $wishlist);
        $wishlistItem->delete();

        return response()->json(['message' => 'Item removed from wishlist']);
    }
}

