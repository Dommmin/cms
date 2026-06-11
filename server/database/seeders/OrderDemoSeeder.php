<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AddressTypeEnum;
use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Enums\ReviewStatusEnum;
use App\Enums\ShipmentStatusEnum;
use App\Models\Address;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\ProductReview;
use App\Models\ProductVariant;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\User;
use App\States\Order\DeliveredState;
use App\States\Order\PaidState;
use App\States\Order\ProcessingState;
use App\States\Order\RefundedState;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Str;

class OrderDemoSeeder extends Seeder
{
    public function run(): void
    {
        $shippingMethods = ShippingMethod::all();
        if ($shippingMethods->isEmpty()) {
            return;
        }

        $variants = ProductVariant::with('product')->inRandomOrder()->limit(100)->get();
        if ($variants->isEmpty()) {
            return;
        }

        $users = User::factory()->count(20)->create();
        $customers = [];

        // Create Customers and Addresses
        foreach ($users as $user) {
            $customer = Customer::query()->create([
                'user_id' => $user->id,
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'email' => $user->email,
                'phone' => fake()->phoneNumber(),
            ]);

            $address = Address::query()->create([
                'customer_id' => $customer->id,
                'type' => AddressTypeEnum::BOTH,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'street' => fake()->streetAddress(),
                'city' => fake()->city(),
                'postal_code' => fake()->postcode(),
                'country_code' => 'PL',
                'phone' => $customer->phone,
                'is_default' => true,
            ]);

            $customers[] = ['customer' => $customer, 'address' => $address];
        }

        // Create Orders
        $statuses = [
            DeliveredState::class,
            PaidState::class,
            ProcessingState::class,
            RefundedState::class,
        ];

        for ($i = 0; $i < 150; $i++) {
            $customerData = fake()->randomElement($customers);
            $customer = $customerData['customer'];
            $address = $customerData['address'];
            $shippingMethod = $shippingMethods->random();

            $orderDate = Date::now()->subDays(random_int(0, 90))->subMinutes(random_int(0, 1440));
            $status = fake()->randomElement($statuses);

            $order = Order::query()->create([
                'customer_id' => $customer->id,
                'reference_number' => 'ORD-'.mb_strtoupper(Str::random(8)),
                'billing_address_id' => $address->id,
                'shipping_address_id' => $address->id,
                'status' => clone new $status(new Order()),
                'subtotal' => 0,
                'shipping_cost' => $shippingMethod->price ?? 1500,
                'tax_amount' => 0,
                'total' => 0,
                'currency_code' => 'PLN',
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            $numItems = random_int(1, 4);
            $subtotal = 0;
            for ($j = 0; $j < $numItems; $j++) {
                $variant = $variants->random();
                $qty = random_int(1, 3);
                $unitPrice = $variant->price;
                $totalPrice = $qty * $unitPrice;
                $subtotal += $totalPrice;

                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'variant_id' => $variant->id,
                    'product_name' => $variant->product->getTranslation('name', 'en'),
                    'variant_name' => (string) ($variant->getTranslation('name', 'en', false) ?: ''),
                    'sku' => $variant->sku,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'shipped_quantity' => ($status === DeliveredState::class) ? $qty : 0,
                ]);

                // Create Product Reviews for Delivered orders randomly
                if ($status === DeliveredState::class && random_int(1, 100) > 70) {
                    ProductReview::query()->firstOrCreate(
                        [
                            'product_id' => $variant->product_id,
                            'customer_id' => $customer->id,
                        ],
                        [
                            'order_id' => $order->id,
                            'rating' => random_int(3, 5),
                            'title' => fake()->sentence(3),
                            'body' => fake()->paragraph(),
                            'status' => ReviewStatusEnum::Approved,
                            'is_verified_purchase' => true,
                            'created_at' => $orderDate->copy()->addDays(random_int(2, 10)),
                        ]
                    );
                }
            }

            $order->subtotal = $subtotal;
            $order->total = $subtotal + $order->shipping_cost;
            $order->tax_amount = (int) ($order->subtotal * 0.23); // Roughly 23%
            $order->save();

            // Create Payment
            Payment::query()->create([
                'order_id' => $order->id,
                'provider' => fake()->randomElement(PaymentProviderEnum::cases()),
                'provider_transaction_id' => 'PAY-'.mb_strtoupper(Str::random(10)),
                'status' => ($status === RefundedState::class) ? PaymentStatusEnum::REFUNDED : PaymentStatusEnum::COMPLETED,
                'amount' => $order->total,
                'currency_code' => 'PLN',
                'created_at' => $orderDate,
            ]);

            // Create Shipment
            if (in_array($status, [DeliveredState::class, ProcessingState::class])) {
                Shipment::query()->create([
                    'order_id' => $order->id,
                    'shipping_method_id' => $shippingMethod->id,
                    'tracking_number' => 'TRK-'.mb_strtoupper(Str::random(12)),
                    'status' => ($status === DeliveredState::class) ? ShipmentStatusEnum::DELIVERED : ShipmentStatusEnum::IN_TRANSIT,
                    'created_at' => $orderDate->copy()->addHours(2),
                ]);
            }
        }
    }
}
