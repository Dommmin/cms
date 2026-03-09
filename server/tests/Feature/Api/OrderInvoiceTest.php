<?php

declare(strict_types=1);

use App\Models\Address;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use App\Services\InvoiceService;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Notification::fake();
    config(['laravel-pdf.driver' => 'dompdf']);

    Currency::query()->firstOrCreate(
        ['code' => 'PLN'],
        ['name' => 'Polish Zloty', 'symbol' => 'zł', 'decimal_places' => 2, 'is_active' => true, 'is_base' => true]
    );
});

function createTestOrderWithCustomer(): array
{
    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Jan',
        'last_name' => 'Kowalski',
    ]);

    $address = Address::query()->create([
        'first_name' => 'Jan', 'last_name' => 'Kowalski',
        'street' => 'ul. Testowa 1', 'city' => 'Warszawa',
        'postal_code' => '00-001', 'country_code' => 'PL',
        'phone' => '500000000', 'address_type' => 'billing',
    ]);

    $order = Order::query()->create([
        'reference_number' => Order::generateReferenceNumber(),
        'customer_id' => $customer->id,
        'billing_address_id' => $address->id,
        'shipping_address_id' => $address->id,
        'status' => 'paid',
        'subtotal' => 5000,
        'discount_amount' => 0,
        'shipping_cost' => 500,
        'tax_amount' => 0,
        'total' => 5500,
        'currency_code' => 'PLN',
        'exchange_rate' => 1.0,
    ]);

    return [$user, $customer, $order];
}

it('customer can download their order invoice', function () {
    [$user, $customer, $order] = createTestOrderWithCustomer();

    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)
        ->get(route('api.v1.orders.invoice', ['reference' => $order->reference_number]));

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('application/pdf');
});

it('customer cannot download another customers order invoice', function () {
    [, , $order] = createTestOrderWithCustomer();
    [$otherUser] = createTestOrderWithCustomer();

    $token = $otherUser->createToken('test')->plainTextToken;

    $this->withToken($token)
        ->get(route('api.v1.orders.invoice', ['reference' => $order->reference_number]))
        ->assertNotFound();
});

it('invoice service can generate and save pdf', function () {
    [, , $order] = createTestOrderWithCustomer();

    Storage::fake('local');

    $service = app(InvoiceService::class);
    $service->save($order, storage_path('app/test-invoice.pdf'));

    expect(file_exists(storage_path('app/test-invoice.pdf')))->toBeTrue();

    @unlink(storage_path('app/test-invoice.pdf'));
});

it('order confirmed notification attaches invoice pdf', function () {
    [$user, , $order] = createTestOrderWithCustomer();

    Storage::fake('local');

    $notification = new App\Notifications\OrderConfirmedNotification($order);
    $mailMessage = $notification->toMail($user);

    $attachments = $mailMessage->rawAttachments;

    expect($attachments)->not->toBeEmpty()
        ->and($attachments[0]['name'])->toBe("invoice-{$order->reference_number}.pdf")
        ->and($attachments[0]['options']['mime'])->toBe('application/pdf')
        ->and($attachments[0]['data'])->not->toBeEmpty();

    // Temp file must be cleaned up after notification is built
    Storage::assertMissing("invoices/invoice-{$order->reference_number}.pdf");
});
