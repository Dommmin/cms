<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use Illuminate\Support\Str;

class WishlistService
{
    public const SESSION_KEY = 'wishlist_session_token';

    public function getOrCreateWishlist(?User $user = null, ?string $wishlistToken = null): Wishlist
    {
        if ($user instanceof User) {
            if (! $user->customer) {
                $customer = $this->ensureCustomerForUser($user);
                $user->setRelation('customer', $customer);

                if ($wishlistToken) {
                    $this->mergeGuestWishlistIntoCustomer($user, $wishlistToken);
                    $user->load('customer');
                }
            } elseif ($wishlistToken) {
                $this->mergeGuestWishlistIntoCustomer($user, $wishlistToken);
            }

            $wishlist = $user->customer->wishlists()->first();

            if (! $wishlist) {
                return $user->customer->wishlists()->create([
                    'name' => 'Wishlist',
                    'is_public' => false,
                ]);
            }

            return $wishlist;
        }

        // Guest: use X-Wishlist-Token header
        if ($wishlistToken) {
            $wishlist = Wishlist::query()->where('session_token', $wishlistToken)->first();

            if ($wishlist instanceof Wishlist) {
                return $wishlist;
            }

            $wishlist = new Wishlist([
                'session_token' => $wishlistToken,
                'name' => 'Wishlist',
                'is_public' => false,
            ]);
            $wishlist->save();

            return $wishlist;
        }

        // Fallback: session-based token
        $sessionToken = (string) session()->get(self::SESSION_KEY);

        if ($sessionToken === '') {
            $sessionToken = Str::uuid()->toString();
            session()->put(self::SESSION_KEY, $sessionToken);
        }

        $wishlist = Wishlist::query()->where('session_token', $sessionToken)->first();

        if ($wishlist instanceof Wishlist) {
            return $wishlist;
        }

        $wishlist = new Wishlist([
            'session_token' => $sessionToken,
            'name' => 'Wishlist',
            'is_public' => false,
        ]);
        $wishlist->save();

        return $wishlist;
    }

    public function getGuestWishlistByToken(string $token): ?Wishlist
    {
        return Wishlist::query()->where('session_token', $token)->first();
    }

    public function mergeGuestWishlistIntoCustomer(User $user, ?string $wishlistToken = null): void
    {
        $customer = $user->customer ?? $this->ensureCustomerForUser($user);

        if ($wishlistToken) {
            $guestWishlist = $this->getGuestWishlistByToken($wishlistToken)?->load('items');
        } else {
            $sessionToken = (string) session()->get(self::SESSION_KEY);
            if ($sessionToken === '' || $sessionToken === '0') {
                return;
            }

            $guestWishlist = Wishlist::query()
                ->where('session_token', $sessionToken)
                ->with('items')
                ->first();
        }

        if (! $guestWishlist instanceof Wishlist || $guestWishlist->items->isEmpty()) {
            if (! $wishlistToken) {
                session()->forget(self::SESSION_KEY);
            }

            return;
        }

        $customerWishlist = $customer->wishlists()->first();

        if (! $customerWishlist) {
            $customerWishlist = $customer->wishlists()->create([
                'name' => 'Wishlist',
                'is_public' => false,
            ]);
        }

        $customerWishlist->load('items');
        $existingVariantIds = $customerWishlist->items->pluck('product_variant_id')->toArray();

        foreach ($guestWishlist->items as $guestItem) {
            if (! in_array($guestItem->product_variant_id, $existingVariantIds, true)) {
                WishlistItem::query()->create([
                    'wishlist_id' => $customerWishlist->id,
                    'product_variant_id' => $guestItem->product_variant_id,
                    'notes' => $guestItem->notes,
                ]);
            }
        }

        $guestWishlist->items()->delete();
        $guestWishlist->delete();

        if (! $wishlistToken) {
            session()->forget(self::SESSION_KEY);
        }
    }

    private function ensureCustomerForUser(User $user): Customer
    {
        return Customer::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['email' => $user->email, 'first_name' => $user->name],
        );
    }
}
