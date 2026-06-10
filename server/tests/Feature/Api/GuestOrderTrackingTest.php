<?php

declare(strict_types=1);

use App\Models\Address;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;

describe('Guest order tracking API', function (): void {
    beforeEach(function (): void {
        $this->address = Address::query()->create([
            'first_name' => 'Jan',
            'last_name' => 'Kowalski',
            'street' => 'ul. Testowa 1',
            'city' => 'Warszawa',
            'postal_code' => '00-001',
            'country_code' => 'PL',
            'phone' => '500000000',
            'address_type' => 'billing',
        ]);

        // Create a basic order
        $this->guestOrder = Order::query()->create([
            'reference_number' => Order::generateReferenceNumber(),
            'guest_email' => 'guest@example.com',
            'billing_address_id' => $this->address->id,
            'shipping_address_id' => $this->address->id,
            'status' => 'pending',
            'subtotal' => 5000,
            'discount_amount' => 0,
            'shipping_cost' => 1000,
            'tax_amount' => 0,
            'total' => 6000,
            'currency_code' => 'PLN',
            'exchange_rate' => 1.0,
        ]);

        $this->guestOrder->statusHistory()->create([
            'previous_status' => 'pending',
            'new_status' => 'pending',
            'changed_by' => 'system',
            'notes' => 'Order created',
            'changed_at' => now(),
        ]);
    });

    it('can track guest order with valid reference number and guest email', function (): void {
        $response = $this->getJson(route('api.v1.orders.track-guest', [
            'reference_number' => $this->guestOrder->reference_number,
            'email' => 'guest@example.com',
        ]))
            ->assertOk()
            ->assertJsonStructure([
                'reference_number',
                'status',
                'created_at',
                'subtotal',
                'shipping_cost',
                'discount_amount',
                'total',
                'currency_code',
                'items',
                'payment',
                'shipment',
                'status_history',
            ]);

        expect($response->json('reference_number'))->toBe($this->guestOrder->reference_number);
        expect($response->json('status'))->toBe('pending');
        expect($response->json('total'))->toBe(6000);
    });

    it('can track a registered user order with valid reference and user email', function (): void {
        $user = User::factory()->create(['email' => 'user@example.com']);
        $customer = Customer::query()->create([
            'user_id' => $user->id,
            'email' => 'user@example.com',
            'first_name' => 'Registered',
        ]);

        $registeredOrder = Order::query()->create([
            'reference_number' => Order::generateReferenceNumber(),
            'customer_id' => $customer->id,
            'billing_address_id' => $this->address->id,
            'shipping_address_id' => $this->address->id,
            'status' => 'paid',
            'subtotal' => 3000,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'total' => 3000,
            'currency_code' => 'PLN',
            'exchange_rate' => 1.0,
        ]);

        $response = $this->getJson(route('api.v1.orders.track-guest', [
            'reference_number' => $registeredOrder->reference_number,
            'email' => 'user@example.com',
        ]))
            ->assertOk();

        expect($response->json('reference_number'))->toBe($registeredOrder->reference_number);
        expect($response->json('status'))->toBe('paid');
    });

    it('returns 404 if email does not match the order email', function (): void {
        $this->getJson(route('api.v1.orders.track-guest', [
            'reference_number' => $this->guestOrder->reference_number,
            'email' => 'wrong-email@example.com',
        ]))
            ->assertNotFound();
    });

    it('returns 404 if reference number does not exist', function (): void {
        $this->getJson(route('api.v1.orders.track-guest', [
            'reference_number' => 'ORD-9999-99999',
            'email' => 'guest@example.com',
        ]))
            ->assertNotFound();
    });

    it('validates required query parameters', function (): void {
        $this->getJson(route('api.v1.orders.track-guest'))
            ->assertUnprocessable();
    });
});
