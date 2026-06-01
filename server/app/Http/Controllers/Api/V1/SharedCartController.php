<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\CreateSharedCartRequest;
use App\Http\Requests\Api\V1\ImportSharedCartRequest;
use App\Http\Resources\Api\V1\CartResource;
use App\Models\Cart;
use App\Models\SharedCart;
use App\Models\User;
use App\Services\CartService;
use App\Services\SharedCartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class SharedCartController extends ApiController
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly SharedCartService $sharedCartService,
    ) {}

    public function store(CreateSharedCartRequest $request): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('sanctum')->user();
        $cart = $this->cartService->getOrCreateCart($user, $request->header('X-Cart-Token'));
        $cart->load('items.variant.product');

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Cannot share an empty cart.'],
            ]);
        }

        $sharedCart = $this->sharedCartService->createFromCart(
            $cart,
            is_string($request->query('locale')) ? $request->query('locale') : null,
            $request->integer('expires_in_days') ?: null,
        );

        return $this->created([
            'token' => $sharedCart->public_token,
            'expires_at' => $sharedCart->expires_at?->toIso8601String(),
        ]);
    }

    public function show(string $token): JsonResponse
    {
        $sharedCart = $this->sharedCartService->findByToken($token);

        abort_if(! $sharedCart instanceof SharedCart, 404, 'Shared cart not found.');
        abort_if(! $sharedCart->is_active || $sharedCart->isExpired(), 410, 'Shared cart is no longer available.');

        return $this->ok($this->sharedCartService->buildPreview($sharedCart));
    }

    public function import(ImportSharedCartRequest $request, string $token): JsonResponse
    {
        $sharedCart = $this->sharedCartService->findByToken($token);

        abort_if(! $sharedCart instanceof SharedCart, 404, 'Shared cart not found.');
        abort_if(! $sharedCart->is_active || $sharedCart->isExpired(), 410, 'Shared cart is no longer available.');

        /** @var User|null $user */
        $user = auth('sanctum')->user();
        $cart = $this->cartService->getOrCreateCart($user, $request->header('X-Cart-Token'));

        $result = $this->sharedCartService->importIntoCart(
            $sharedCart,
            $cart,
            $request->string('mode')->toString() ?: 'merge',
        );

        /** @var Cart $updatedCart */
        $updatedCart = $result['cart'];

        return $this->ok([
            'mode' => $result['mode'],
            'added_items' => $result['added_items'],
            'merged_items' => $result['merged_items'],
            'skipped_items' => $result['skipped_items'],
            'partial_items' => $result['partial_items'],
            'imported_quantity' => $result['imported_quantity'],
            'discount_cleared' => $result['discount_cleared'],
            'message' => 'Shared cart imported.',
            'cart' => new CartResource($updatedCart),
        ]);
    }
}
