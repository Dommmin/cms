<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Domain\Models\Cart;
use App\Modules\Ecommerce\Domain\Models\CartItem;
use App\Modules\Ecommerce\Domain\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Cart Controller
 * Moved to Ecommerce module
 */
final class CartController extends Controller
{
    private function getCart(): Cart
    {
        $customer = auth()->user()->customer;
        return $customer->cart ?? Cart::create(['customer_id' => $customer->id]);
    }

    /**
     * GET /api/cart
     */
    public function show(): JsonResponse
    {
        $cart = $this->getCart();
        $this->authorize('view', $cart);
        $cart->load('items.variant.product');

        return response()->json([
            'cart' => $cart,
            'subtotal' => $cart->subtotal(),
            'item_count' => $cart->itemCount(),
        ]);
    }

    /**
     * POST /api/cart/items
     */
    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $variant = ProductVariant::findOrFail($request->variant_id);
        $cart = $this->getCart();

        if (!$variant->isInStock()) {
            return response()->json(['message' => 'Product is not available'], 422);
        }

        $existingItem = $cart->items()->where('variant_id', $variant->id)->first();

        if ($existingItem) {
            $existingItem->increment('quantity', $request->quantity);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'variant_id' => $variant->id,
                'quantity' => $request->quantity,
            ]);
        }

        $cart->load('items.variant.product');

        return response()->json([
            'cart' => $cart,
            'subtotal' => $cart->subtotal(),
            'item_count' => $cart->itemCount(),
        ]);
    }

    /**
     * PUT /api/cart/items/{cartItem}
     */
    public function updateItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $cart = $cartItem->cart;
        $this->authorize('update', $cart);

        if ($request->quantity === 0) {
            $cartItem->delete();
        } else {
            $cartItem->update(['quantity' => $request->quantity]);
        }

        $cart->load('items.variant.product');

        return response()->json([
            'cart' => $cart,
            'subtotal' => $cart->subtotal(),
            'item_count' => $cart->itemCount(),
        ]);
    }

    /**
     * DELETE /api/cart/items/{cartItem}
     */
    public function removeItem(CartItem $cartItem): JsonResponse
    {
        $cart = $cartItem->cart;
        $this->authorize('update', $cart);
        $cartItem->delete();

        $cart->load('items.variant.product');

        return response()->json([
            'cart' => $cart,
            'subtotal' => $cart->subtotal(),
            'item_count' => $cart->itemCount(),
        ]);
    }

    /**
     * DELETE /api/cart
     */
    public function clear(): JsonResponse
    {
        $cart = $this->getCart();
        $cart->items()->delete();

        return response()->json(['message' => 'Cart cleared']);
    }
}

