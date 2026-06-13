<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\StoreWishlistItemRequest;
use App\Http\Resources\Api\V1\WishlistResource;
use App\Models\User;
use App\Services\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends ApiController
{
    public function show(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('sanctum')->user();
        $wishlist = resolve(WishlistService::class)->getOrCreateWishlist(
            $user,
            $request->header('X-Wishlist-Token'),
        );
        $wishlist->load('items.variant.product.thumbnail');

        $response = $this->ok(new WishlistResource($wishlist));

        if (! $user && $wishlist->session_token) {
            $response->header('X-Wishlist-Token', $wishlist->session_token);
        }

        return $response;
    }

    public function addItem(StoreWishlistItemRequest $request): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('sanctum')->user();
        $wishlist = resolve(WishlistService::class)->getOrCreateWishlist(
            $user,
            $request->header('X-Wishlist-Token'),
        );

        $alreadyExists = $wishlist->items()->where('product_variant_id', $request->variant_id)->exists();

        if (! $alreadyExists) {
            $wishlist->items()->create([
                'product_variant_id' => $request->variant_id,
            ]);
        }

        $wishlist->load('items.variant.product.thumbnail');

        $response = $this->ok(new WishlistResource($wishlist));

        if (! $user && $wishlist->session_token) {
            $response->header('X-Wishlist-Token', $wishlist->session_token);
        }

        return $response;
    }

    public function removeItem(Request $request, int $variantId): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('sanctum')->user();
        $wishlist = resolve(WishlistService::class)->getOrCreateWishlist(
            $user,
            $request->header('X-Wishlist-Token'),
        );

        $wishlist->items()->where('product_variant_id', $variantId)->delete();
        $wishlist->load('items.variant.product.thumbnail');

        $response = $this->ok(new WishlistResource($wishlist));

        if (! $user && $wishlist->session_token) {
            $response->header('X-Wishlist-Token', $wishlist->session_token);
        }

        return $response;
    }
}
