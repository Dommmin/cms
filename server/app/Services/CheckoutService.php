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
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Referral;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Services\Hooks\Checkout\CheckoutCompletedAction;
use App\Services\Hooks\Checkout\CheckoutCreatingFilter;
use App\Services\Hooks\Facades\Hook;
use Illuminate\Support\Arr;

class CheckoutService
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly LegalDocumentVersionService $legalDocumentVersionService,
        private readonly TaxService $taxService,
    ) {}

    /**
     * @param  array<string, mixed>  $billingAddress
     * @param  array<string, mixed>  $shippingAddress
     */
    public function checkout(
        ?User $user,
        ?int $shippingMethodId,
        PaymentProviderEnum $paymentProvider,
        array $billingAddress,
        ?array $shippingAddress,
        ?string $guestEmail = null,
        ?string $cartToken = null,
        ?string $pickupPointId = null,
        ?string $notes = null,
        ?string $referralCode = null,
        ?string $gaClientId = null,
        ?string $customerType = 'individual',
        ?bool $wantsInvoice = false
    ): Order {
        if ($user instanceof User) {
            if (! $user->customer) {
                Customer::query()->firstOrCreate(
                    ['user_id' => $user->id],
                    ['email' => $user->email, 'first_name' => $user->name],
                );

                $user->load('customer');
            }

            $this->cartService->mergeGuestCartIntoCustomer($user, $cartToken);
            $cart = $this->cartService->getOrCreateCart($user);
            $customer = $user->customer;
        } else {
            $customer = null;
            $cart = $this->cartService->getOrCreateCart(null, $cartToken);
        }

        $cart->load([
            'items.variant.product.category.taxRate',
            'items.variant.taxRate',
        ]);

        abort_if($cart->isEmpty(), 422, 'Cart is empty');

        [$discountAmount, $freeShipping] = $this->resolveDiscount($cart);

        $requiresShipping = $cart->items->contains(fn ($item) => $item->variant->product->productType->is_shippable ?? true);

        $affiliateCode = $this->resolveAffiliateCode($referralCode);
        if ($affiliateCode instanceof AffiliateCode) {
            $subtotalBeforeAffiliate = $cart->subtotal();
            $affiliateDiscount = $affiliateCode->calculateDiscount($subtotalBeforeAffiliate);
            $discountAmount = max($discountAmount, $affiliateDiscount);
        }

        $subtotal = $cart->subtotal();
        $subtotalAfterDiscount = max(0, $subtotal - $discountAmount);

        $resolvedCustomerType = $customerType ?? 'individual';
        $isExempt = $customer instanceof Customer && $customer->is_tax_exempt;

        if ($customer && $resolvedCustomerType === 'business') {
            $customer->update([
                'customer_type' => 'business',
                'company_name' => $billingAddress['company_name'] ?? $customer->company_name,
                'tax_id' => $billingAddress['vat_id'] ?? $customer->tax_id,
            ]);
        }

        $billing = $this->firstOrCreateAddress($billingAddress, $customer, AddressTypeEnum::BILLING);

        if ($requiresShipping) {
            abort_if($shippingMethodId === null, 422, 'Shipping method is required');
            $shippingMethod = ShippingMethod::query()->where('is_active', true)->findOrFail($shippingMethodId);
            $totalWeightKg = $this->calculateTotalWeightKg($cart);
            $shippingCost = $freeShipping ? 0 : $shippingMethod->calculateCost($totalWeightKg, $subtotalAfterDiscount);
            $shipping = $this->firstOrCreateAddress($shippingAddress ?? $billingAddress, $customer, AddressTypeEnum::SHIPPING);
        } else {
            $shippingMethod = null;
            $shippingCost = 0;
            $shipping = $billing;
        }

        // Run Tax calculation using TaxService
        $billingCountry = $billingAddress['country_code'] ?? 'PL';
        $billingVatId = $billingAddress['vat_id'] ?? null;

        $taxDetails = $this->taxService->calculateCartTax(
            items: $cart->items,
            countryCode: $billingCountry,
            customerType: $resolvedCustomerType,
            vatId: $billingVatId,
            isTaxExempt: $isExempt,
            shippingCost: $shippingCost,
            shippingMethodId: $shippingMethodId
        );

        $total = max(0, $subtotalAfterDiscount + $shippingCost);

        // Adjust tax amounts proportionally if discount is applied
        $finalTaxAmount = $taxDetails['total_tax'];
        $finalItemsTax = $taxDetails['items_tax'];
        $finalShippingTax = $taxDetails['shipping_tax'];

        if ($discountAmount > 0 && $taxDetails['total_gross'] > 0) {
            $discountRatio = $total / $taxDetails['total_gross'];
            $finalTaxAmount = (int) round($taxDetails['total_tax'] * $discountRatio);
            $finalItemsTax = (int) round($taxDetails['items_tax'] * $discountRatio);
            $finalShippingTax = (int) round($taxDetails['shipping_tax'] * $discountRatio);
        }

        $legalSnapshot = $this->legalDocumentVersionService->checkoutLegalSnapshot();

        if ($total === 0) {
            $initialStatus = OrderStatusEnum::PROCESSING;
        } else {
            $initialStatus = $paymentProvider === PaymentProviderEnum::CASH_ON_DELIVERY
                ? OrderStatusEnum::PENDING
                : OrderStatusEnum::AWAITING;
        }

        $orderData = [
            'reference_number' => Order::generateReferenceNumber(),
            'customer_id' => $customer?->id,
            'customer_type' => $resolvedCustomerType,
            'is_tax_exempt' => $isExempt,
            'wants_invoice' => (bool) $wantsInvoice,
            'buyer_company_name' => $resolvedCustomerType === 'business' ? ($billingAddress['company_name'] ?? null) : null,
            'buyer_vat_id' => $resolvedCustomerType === 'business' ? ($billingAddress['vat_id'] ?? null) : null,
            'guest_email' => $customer === null ? $guestEmail : null,
            'billing_address_id' => $billing->id,
            'shipping_address_id' => $shipping->id,
            'status' => $initialStatus->value,
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'shipping_cost' => $shippingCost,
            'tax_amount' => $finalTaxAmount,
            'items_tax_amount' => $finalItemsTax,
            'shipping_tax_amount' => $finalShippingTax,
            'total' => $total,
            'currency_code' => 'PLN',
            'exchange_rate' => 1.0,
            'notes' => $notes,
            'ga_client_id' => $gaClientId,
            'terms_consent_version' => $legalSnapshot['terms_of_service'],
            'privacy_consent_version' => $legalSnapshot['privacy_policy'],
            'legal_version_snapshot' => $legalSnapshot,
            'terms_accepted_at' => now(),
        ];

        $filter = Hook::filter(new CheckoutCreatingFilter($orderData, $cart));
        $orderData = $filter->orderData;

        $order = Order::query()->create($orderData);

        /** @var CartItem $cartItem */
        foreach ($cart->items as $cartItem) {
            $variant = $cartItem->variant;

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

        if ($shippingMethod) {
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
        }

        $inventoryService = resolve(InventoryService::class);
        $inventoryService->reserveCart($cart, 0);
        $inventoryService->commitCartReservations($cart);

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

        Hook::action(new CheckoutCompletedAction($order));

        return $order;
    }

    private function calculateTotalWeightKg(Cart $cart): float
    {
        return (float) $cart->items->sum(function ($item): float {
            /** @var CartItem $item */
            $variant = $item->variant;

            $weight = (float) ($variant->weight ?? 0);

            return $weight * (int) $item->quantity;
        });
    }

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

    /**
     * @param  array<string, mixed>  $payload
     */
    private function firstOrCreateAddress(array $payload, ?Customer $customer, AddressTypeEnum $type): Address
    {
        $mapped = $this->mapAddressPayload($payload, $customer, $type);

        if (! $customer instanceof Customer) {
            return Address::query()->create($mapped);
        }

        $existing = Address::findMatchingAddress($customer->id, $type, $mapped);

        if ($existing instanceof Address) {
            return $existing;
        }

        return Address::query()->create($mapped);
    }
}
