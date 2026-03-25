<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\User;

class CartService
{
    public const SESSION_CART_KEY = 'cart_session_token';

    public function getOrCreateCart(?User $user = null, ?string $cartToken = null): Cart
    {
        if ($user instanceof User) {
            // Ensure a Customer record always exists for authenticated users.
            // Without this, cart items added post-login go into the guest token cart
            // while checkout uses the (empty) customer cart, causing a mismatch.
            if (! $user->customer) {
                $customer = $this->ensureCustomerForUser($user);
                $user->setRelation('customer', $customer);

                // Automatically merge any guest token cart into the new customer cart
                if ($cartToken) {
                    $this->mergeGuestCartIntoCustomer($user, $cartToken);
                    $user->load('customer');
                }
            } elseif ($cartToken) {
                // Safety-net merge: if AuthController::mergeGuestCartIntoCustomer was
                // called with a null token (e.g. localStorage wasn't populated yet) the
                // guest cart survives. Merge it now. mergeGuestCartIntoCustomer returns
                // early when the guest cart is absent, so this is safe to call always.
                $this->mergeGuestCartIntoCustomer($user, $cartToken);
            }

            $cart = $user->customer->cart;
            if ($cart instanceof Cart) {
                return $cart;
            }

            $cart = new Cart([
                'customer_id' => $user->customer->id,
            ]);
            $cart->save();

            return $cart;
        }

        // REST/mobile: use X-Cart-Token header value
        if ($cartToken) {
            /** @var Cart|null $cart */
            $cart = Cart::query()->where('session_token', $cartToken)->first();

            if ($cart instanceof Cart) {
                return $cart;
            }

            $cart = new Cart(['session_token' => $cartToken]);
            $cart->save();

            return $cart;
        }

        $sessionToken = $this->getSessionToken();
        /** @var Cart|null $cart */
        $cart = Cart::query()->where('session_token', $sessionToken)->first();

        if ($cart instanceof Cart) {
            return $cart;
        }

        $cart = new Cart([
            'session_token' => $sessionToken,
        ]);
        $cart->save();

        session()->put(self::SESSION_CART_KEY, $sessionToken);

        return $cart;
    }

    public function getGuestCartByToken(string $token): ?Cart
    {
        return Cart::query()->where('session_token', $token)->first();
    }

    /**
     * Merge guest (session) cart into customer cart. Call after login.
     * Pass $cartToken for stateless REST clients (X-Cart-Token header).
     */
    public function mergeGuestCartIntoCustomer(User $user, ?string $cartToken = null): void
    {
        // Always ensure a Customer record exists — even when there's nothing to merge.
        // This prevents the edge-case where an authenticated user has no Customer row.
        $customer = $user->customer ?? $this->ensureCustomerForUser($user);

        if ($cartToken) {
            $guestCart = $this->getGuestCartByToken($cartToken)?->load('items.variant');
        } else {
            $sessionToken = $this->getSessionToken();
            if ($sessionToken === '' || $sessionToken === '0') {
                return;
            }

            /** @var Cart|null $guestCart */
            $guestCart = Cart::query()
                ->where('session_token', $sessionToken)
                ->with('items.variant')
                ->first();
        }

        if (! $guestCart instanceof Cart || $guestCart->items->isEmpty()) {
            if (! $cartToken) {
                session()->forget(self::SESSION_CART_KEY);
            }

            return;
        }

        $customerCart = $customer->cart;
        if (! $customerCart instanceof Cart) {
            $customerCart = new Cart(['customer_id' => $customer->id]);
            $customerCart->save();
        }

        $customerCart->load('items');

        foreach ($guestCart->items as $guestItem) {
            $existing = $customerCart->items->firstWhere('variant_id', $guestItem->variant_id);
            if ($existing) {
                $existing->increment('quantity', $guestItem->quantity);
            } else {
                CartItem::query()->create([
                    'cart_id' => $customerCart->id,
                    'variant_id' => $guestItem->variant_id,
                    'quantity' => $guestItem->quantity,
                ]);
            }
        }

        $guestCart->items()->delete();
        $guestCart->delete();

        if (! $cartToken) {
            session()->forget(self::SESSION_CART_KEY);
        }
    }

    public function currentCartBelongsToUser(Cart $cart, User $user): bool
    {
        if ($cart->customer_id) {
            return $user->customer && $cart->customer_id === $user->customer->id;
        }

        return $cart->session_token === $this->getSessionToken();
    }

    public function cartItemBelongsToCurrentCart(CartItem $cartItem, Cart $currentCart): bool
    {
        return $cartItem->cart_id === $currentCart->id;
    }

    private function getSessionToken(): string
    {
        $token = session()->get(self::SESSION_CART_KEY);
        if (is_string($token) && $token !== '') {
            return $token;
        }

        $token = session()->getId();
        session()->put(self::SESSION_CART_KEY, $token);

        return $token;
    }

    private function ensureCustomerForUser(User $user): Customer
    {
        $customer = $user->customer;
        if ($customer) {
            return $customer;
        }

        return Customer::query()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->name,
        ]);
    }
}
