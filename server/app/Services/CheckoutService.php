<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AddressTypeEnum;
use App\Enums\OrderStatusEnum;
use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Enums\ShipmentStatusEnum;
use App\Models\Address;
use App\Models\AffiliateCode;
use App\Models\Cart;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Models\Referral;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\TaxRate;
use App\Models\User;
use Illuminate\Support\Arr;

class CheckoutService
{
    public function __construct(
        private readonly CartService $cartService
    ) {}

    /**
     * @param  array<string, mixed>  $billingAddress
     * @param  array<string, mixed>  $shippingAddress
     */
    public function checkout(
        ?User $user,
        int $shippingMethodId,
        PaymentProviderEnum $paymentProvider,
        array $billingAddress,
        array $shippingAddress,
        ?string $guestEmail = null,
        ?string $cartToken = null,
        ?string $pickupPointId = null,
        ?string $notes = null,
        ?string $referralCode = null
    ): Order {
        if ($user instanceof User) {
            if (! $user->customer) {
                Customer::query()->create([
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'first_name' => $user->name,
                ]);

                $user->load('customer');
            }

            $this->cartService->mergeGuestCartIntoCustomer($user, $cartToken);
            $cart = $this->cartService->getOrCreateCart($user);
            $customer = $user->customer;
        } else {
            $customer = null;
            $cart = $this->cartService->getOrCreateCart(null, $cartToken);
        }

        $cart->load('items.variant.product.category');

        abort_if($cart->isEmpty(), 422, 'Cart is empty');

        $shippingMethod = ShippingMethod::query()->where('is_active', true)->findOrFail($shippingMethodId);

        [$discountAmount, $freeShipping] = $this->resolveDiscount($cart);

        $affiliateCode = $this->resolveAffiliateCode($referralCode);
        if ($affiliateCode instanceof AffiliateCode) {
            $subtotalBeforeAffiliate = $cart->subtotal();
            $affiliateDiscount = $affiliateCode->calculateDiscount($subtotalBeforeAffiliate);
            $discountAmount = max($discountAmount, $affiliateDiscount);
        }

        $subtotal = $cart->subtotal();
        $subtotalAfterDiscount = max(0, $subtotal - $discountAmount);

        $totalWeightKg = $this->calculateTotalWeightKg($cart);

        $shippingCost = $freeShipping ? 0 : $shippingMethod->calculateCost($totalWeightKg, $subtotalAfterDiscount);

        $taxAmount = $this->calculateTaxAmount($cart);

        $total = max(0, $subtotalAfterDiscount + $shippingCost);

        $billing = Address::query()->create($this->mapAddressPayload($billingAddress, $customer, AddressTypeEnum::BILLING));
        $shipping = Address::query()->create($this->mapAddressPayload($shippingAddress, $customer, AddressTypeEnum::SHIPPING));

        $initialStatus = $paymentProvider === PaymentProviderEnum::CASH_ON_DELIVERY
            ? OrderStatusEnum::PENDING
            : OrderStatusEnum::AWAITING;

        $order = Order::query()->create([
            'reference_number' => Order::generateReferenceNumber(),
            'customer_id' => $customer?->id,
            'guest_email' => $customer === null ? $guestEmail : null,
            'billing_address_id' => $billing->id,
            'shipping_address_id' => $shipping->id,
            'status' => $initialStatus->value,
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'shipping_cost' => $shippingCost,
            'tax_amount' => $taxAmount,
            'total' => $total,
            'currency_code' => 'PLN',
            'exchange_rate' => 1.0,
            'notes' => $notes,
        ]);

        foreach ($cart->items as $cartItem) {
            $variant = $cartItem->variant;
            if (! $variant instanceof ProductVariant) {
                continue;
            }

            OrderItem::query()->create(array_merge(
                ['order_id' => $order->id],
                OrderItem::fromVariant($variant, (int) $cartItem->quantity)
            ));
        }

        Payment::query()->create([
            'order_id' => $order->id,
            'provider' => $paymentProvider->value,
            'provider_transaction_id' => null,
            'status' => PaymentStatusEnum::PENDING->value,
            'amount' => $order->total,
            'currency_code' => $order->currency_code,
            'payload' => null,
        ]);

        Shipment::query()->create([
            'order_id' => $order->id,
            'shipping_method_id' => $shippingMethod->id,
            'carrier' => $shippingMethod->carrier->value,
            'tracking_number' => null,
            'label_url' => null,
            'status' => ShipmentStatusEnum::PENDING->value,
            'pickup_point_id' => $pickupPointId,
            'carrier_payload' => null,
        ]);

        $cart->items()->delete();
        $cart->update(['discount_code' => null]);

        if ($affiliateCode && $user instanceof User) {
            $commission = $affiliateCode->calculateCommission($order->total);
            Referral::query()->create([
                'affiliate_code_id' => $affiliateCode->id,
                'order_id' => $order->id,
                'referred_user_id' => $user->id,
                'order_total' => $order->total,
                'commission_amount' => $commission,
                'status' => 'pending',
            ]);
            $affiliateCode->increment('uses_count');
        }

        $order->load(['items.variant.product', 'billingAddress', 'shippingAddress', 'payment', 'shipment', 'statusHistory']);

        return $order;
    }

    private function calculateTotalWeightKg(Cart $cart): float
    {
        return (float) $cart->items->sum(function ($item): float {
            $variant = $item->variant;
            if (! $variant instanceof ProductVariant) {
                return 0;
            }

            $weight = (float) ($variant->weight ?? 0);

            return $weight * (int) $item->quantity;
        });
    }

    private function calculateTaxAmount(Cart $cart): int
    {
        return (int) $cart->items->sum(function ($item): int {
            $variant = $item->variant;
            if (! $variant instanceof ProductVariant) {
                return 0;
            }

            $gross = $variant->price * (int) $item->quantity;
            $taxRate = $variant->effectiveTaxRate();

            return $taxRate instanceof TaxRate ? $taxRate->taxFromGross($gross) : 0;
        });
    }

    /**
     * @return array{0: int, 1: bool}
     */
    private function resolveAffiliateCode(?string $code): ?AffiliateCode
    {
        if (! is_string($code) || $code === '') {
            return null;
        }

        $affiliateCode = AffiliateCode::query()->where('code', $code)->first();

        return ($affiliateCode instanceof AffiliateCode && $affiliateCode->isValid()) ? $affiliateCode : null;
    }

    private function resolveDiscount(Cart $cart): array
    {
        $code = $cart->getAttributeValue('discount_code');
        if (! is_string($code) || $code === '') {
            return [0, false];
        }

        $discount = Discount::query()->where('code', $code)->first();
        if (! $discount || ! $discount->isValid()) {
            return [0, false];
        }

        $discountAmount = $discount->calculateDiscount($cart->subtotal());
        $freeShipping = $discount->type === 'free_shipping';

        return [max(0, (int) $discountAmount), $freeShipping];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function mapAddressPayload(array $payload, ?Customer $customer, AddressTypeEnum $type): array
    {
        return [
            'customer_id' => $customer?->id,
            'type' => $type->value,
            'first_name' => (string) Arr::get($payload, 'first_name'),
            'last_name' => (string) Arr::get($payload, 'last_name'),
            'company_name' => Arr::get($payload, 'company_name'),
            'street' => (string) Arr::get($payload, 'street'),
            'street2' => Arr::get($payload, 'street2'),
            'city' => (string) Arr::get($payload, 'city'),
            'postal_code' => (string) Arr::get($payload, 'postal_code'),
            'country_code' => (string) (Arr::get($payload, 'country_code') ?? 'PL'),
            'phone' => (string) Arr::get($payload, 'phone'),
            'is_default' => false,
        ];
    }
}
