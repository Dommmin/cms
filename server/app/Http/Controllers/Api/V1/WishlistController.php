<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\WishlistResource;
use App\Models\Customer;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $wishlist = $this->getOrCreateWishlist($request);
        $wishlist->load('items.variant.product');

        return response()->json(['data' => new WishlistResource($wishlist)]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'variant_id' => ['required', 'integer', 'exists:product_variants,id'],
        ]);

        $wishlist = $this->getOrCreateWishlist($request);

        $alreadyExists = $wishlist->items()->where('product_variant_id', $request->variant_id)->exists();

        if (! $alreadyExists) {
            $wishlist->items()->create([
                'product_variant_id' => $request->variant_id,
            ]);
        }

        $wishlist->load('items.variant.product');

        return response()->json(['data' => new WishlistResource($wishlist)]);
    }

    public function removeItem(Request $request, int $variantId): JsonResponse
    {
        $wishlist = $this->getOrCreateWishlist($request);
        $wishlist->items()->where('product_variant_id', $variantId)->delete();
        $wishlist->load('items.variant.product');

        return response()->json(['data' => new WishlistResource($wishlist)]);
    }

    private function getOrCreateWishlist(Request $request): Wishlist
    {
        $user = $request->user();
        $customer = $user->customer;

        if (! $customer) {
            $customer = Customer::query()->create([
                'user_id' => $user->id,
                'email' => $user->email,
                'first_name' => $user->name,
            ]);
        }

        $wishlist = $customer->wishlists()->first();

        if (! $wishlist) {
            $wishlist = $customer->wishlists()->create([
                'name' => 'Wishlist',
                'is_public' => false,
            ]);
        }

        return $wishlist;
    }
}
