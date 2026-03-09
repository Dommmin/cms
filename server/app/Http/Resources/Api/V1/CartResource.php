<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Cart
 */
class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Cart $cart */
        $cart = $this->resource;

        $subtotal = $cart->subtotal();

        return [
            'id' => $cart->id,
            'token' => $cart->session_token,
            'items' => CartItemResource::collection($cart->items ?? []),
            'subtotal' => $subtotal,
            'discount_amount' => 0,
            'total' => $subtotal,
            'discount_code' => $cart->discount_code,
            'currency' => 'USD',
            'items_count' => $cart->itemCount(),
        ];
    }
}
