<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ApplyDiscountRequest;
use App\Http\Requests\Api\V1\StoreCartItemRequest;
use App\Http\Requests\Api\V1\UpdateCartItemRequest;
use App\Http\Resources\Api\V1\CartResource;
use App\Models\CartItem;
use App\Models\Discount;
use App\Models\ProductVariant;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartController extends ApiController
{
    public function __construct(
        private readonly CartService $cartService
    ) {}

    public function show(Request $request): JsonResponse
    {
        $cart = $this->cartService->getOrCreateCart($request->user(), $request->header('X-Cart-Token'));
        $cart->load('items.variant.product');

        return $this->ok(new CartResource($cart));
    }

    public function addItem(StoreCartItemRequest $request): JsonResponse
    {
        $data = $request->validated();
        $variant = ProductVariant::query()->findOrFail($data['variant_id']);

        if ($variant->stock_quantity < $data['quantity']) {
            throw ValidationException::withMessages([
                'quantity' => [sprintf('Not enough stock available. Available: %d', $variant->stock_quantity)],
            ]);
        }

        $cart = $this->cartService->getOrCreateCart($request->user(), $request->header('X-Cart-Token'));
        $existing = $cart->items()->where('variant_id', $variant->id)->first();

        if ($existing) {
            $newQty = $existing->quantity + $data['quantity'];
            if ($newQty > $variant->stock_quantity) {
                throw ValidationException::withMessages([
                    'quantity' => [sprintf('Not enough stock available. Available: %d', $variant->stock_quantity)],
                ]);
            }

            $existing->update(['quantity' => $newQty]);
        } else {
            $cart->items()->create([
                'variant_id' => $variant->id,
                'quantity' => $data['quantity'],
            ]);
        }

        $cart->load('items.variant.product');

        return $this->ok(new CartResource($cart));
    }

    public function updateItem(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        $cart = $this->cartService->getOrCreateCart($request->user(), $request->header('X-Cart-Token'));

        abort_unless($this->cartService->cartItemBelongsToCurrentCart($cartItem, $cart), 403, 'Cart item does not belong to your cart');

        $data = $request->validated();
        $variant = $cartItem->variant;

        if ($variant && $data['quantity'] > $variant->stock_quantity) {
            throw ValidationException::withMessages([
                'quantity' => [sprintf('Not enough stock available. Available: %d', $variant->stock_quantity)],
            ]);
        }

        $cartItem->update(['quantity' => $data['quantity']]);
        $cart->load('items.variant.product');

        return $this->ok(new CartResource($cart));
    }

    public function removeItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $cart = $this->cartService->getOrCreateCart($request->user(), $request->header('X-Cart-Token'));

        abort_unless($this->cartService->cartItemBelongsToCurrentCart($cartItem, $cart), 403, 'Cart item does not belong to your cart');

        $cartItem->delete();
        $cart->load('items.variant.product');

        return $this->ok(new CartResource($cart));
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->cartService->getOrCreateCart($request->user(), $request->header('X-Cart-Token'));
        $cart->items()->delete();
        $cart->update(['discount_code' => null]);
        $cart->load('items.variant.product');

        return $this->ok(new CartResource($cart));
    }

    public function applyDiscount(ApplyDiscountRequest $request): JsonResponse
    {
        $data = $request->validated();
        $cart = $this->cartService->getOrCreateCart($request->user(), $request->header('X-Cart-Token'));

        $discount = Discount::query()
            ->where('code', mb_strtoupper((string) $data['code']))
            ->where('is_active', true)
            ->first();

        if (! $discount || ! $discount->isValid()) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired discount code'],
            ]);
        }

        $subtotal = $cart->subtotal();
        if ($discount->min_order_value && $subtotal < $discount->min_order_value) {
            throw ValidationException::withMessages([
                'code' => [sprintf('Minimum order value of %s cents required', $discount->min_order_value)],
            ]);
        }

        $cart->getConnection()
            ->table('carts')
            ->where('id', $cart->id)
            ->update(['discount_code' => mb_strtoupper((string) $data['code'])]);

        $discountAmount = $discount->calculateDiscount($subtotal);
        $cart->load('items.variant.product');

        return $this->ok([
            'cart' => new CartResource($cart),
            'discount' => [
                'code' => $discount->code,
                'name' => $discount->name,
                'type' => $discount->type,
                'discount_amount' => $discountAmount,
            ],
        ]);
    }

    public function removeDiscount(Request $request): JsonResponse
    {
        $cart = $this->cartService->getOrCreateCart($request->user(), $request->header('X-Cart-Token'));

        $cart->getConnection()
            ->table('carts')
            ->where('id', $cart->id)
            ->update(['discount_code' => null]);

        $cart->load('items.variant.product');

        return $this->ok(new CartResource($cart));
    }
}
