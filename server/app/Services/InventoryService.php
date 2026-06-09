<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Cart;
use App\Models\InventoryReservation;
use App\Models\ProductVariant;
use Exception;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * @throws Exception
     */
    public function reserveCart(Cart $cart, int $minutes = 15): void
    {
        DB::transaction(function () use ($cart, $minutes) {
            $cart->loadMissing('items.variant');
            
            // Zwalniamy wcześniej przypisane do tego koszyka rezerwacje by zapobiec dublowaniu rezerwacji
            $this->releaseCartReservations($cart);

            foreach ($cart->items as $item) {
                $variant = $item->variant;

                if (! $variant->backorder_allowed) {
                    if ($variant->stock_quantity < $item->quantity) {
                        throw new Exception("Brak wystarczającej ilości towaru dla: " . ($variant->name ?? $variant->sku));
                    }
                }

                $variant->decrement('stock_quantity', $item->quantity);

                InventoryReservation::create([
                    'product_variant_id' => $variant->id,
                    'cart_id' => $cart->id,
                    'quantity' => $item->quantity,
                    'expires_at' => now()->addMinutes($minutes),
                ]);
            }
        });
    }

    public function releaseCartReservations(Cart $cart): void
    {
        DB::transaction(function () use ($cart) {
            $reservations = InventoryReservation::where('cart_id', $cart->id)->get();
            
            foreach ($reservations as $reservation) {
                ProductVariant::where('id', $reservation->product_variant_id)
                    ->increment('stock_quantity', $reservation->quantity);
            }
            
            InventoryReservation::where('cart_id', $cart->id)->delete();
        });
    }

    public function releaseExpiredReservations(): int
    {
        return DB::transaction(function () {
            $expired = InventoryReservation::where('expires_at', '<=', now())->get();
            $count = 0;
            
            foreach ($expired as $reservation) {
                ProductVariant::where('id', $reservation->product_variant_id)
                    ->increment('stock_quantity', $reservation->quantity);
                $reservation->delete();
                $count++;
            }
            
            return $count;
        });
    }
    
    public function commitCartReservations(Cart $cart): void
    {
        // Gdy zamówienie zostanie opłacone/złożone, usuwamy rezerwacje. 
        // Stan magazynowy (stock_quantity) został już odjęty podczas reserveCart()
        InventoryReservation::where('cart_id', $cart->id)->delete();
    }
}
