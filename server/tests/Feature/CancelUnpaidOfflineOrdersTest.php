<?php

declare(strict_types=1);

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentProviderEnum;
use App\Enums\SettingTypeEnum;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('automatically cancels unpaid bank transfer and cash on delivery orders after deadline', function (): void {
    // 1. Configure the deadline to 5 days
    Setting::query()->updateOrCreate(
        ['group' => 'payments', 'key' => 'offline_payment_deadline_days'],
        ['type' => SettingTypeEnum::Integer, 'value' => 5, 'is_public' => true]
    );

    // 2. Create bank transfer order older than 5 days in awaiting_payment status
    $oldBankTransfer = Order::factory()->create([
        'status' => OrderStatusEnum::AWAITING->value,
        'created_at' => now()->subDays(6),
    ]);
    Payment::factory()->create([
        'order_id' => $oldBankTransfer->id,
        'provider' => PaymentProviderEnum::BANK_TRANSFER->value,
    ]);

    // 3. Create bank transfer order newer than 5 days in awaiting_payment status
    $newBankTransfer = Order::factory()->create([
        'status' => OrderStatusEnum::AWAITING->value,
        'created_at' => now()->subDays(1),
    ]);
    Payment::factory()->create([
        'order_id' => $newBankTransfer->id,
        'provider' => PaymentProviderEnum::BANK_TRANSFER->value,
    ]);

    // 4. Create cash on delivery order older than 5 days in pending status
    $oldCOD = Order::factory()->create([
        'status' => OrderStatusEnum::PENDING->value,
        'created_at' => now()->subDays(6),
    ]);
    Payment::factory()->create([
        'order_id' => $oldCOD->id,
        'provider' => PaymentProviderEnum::CASH_ON_DELIVERY->value,
    ]);

    // 5. Create cash on delivery order newer than 5 days in pending status
    $newCOD = Order::factory()->create([
        'status' => OrderStatusEnum::PENDING->value,
        'created_at' => now()->subDays(1),
    ]);
    Payment::factory()->create([
        'order_id' => $newCOD->id,
        'provider' => PaymentProviderEnum::CASH_ON_DELIVERY->value,
    ]);

    // 6. Run the artisan command
    $this->artisan('orders:cancel-unpaid-offline')
        ->expectsOutput('Automatically cancelled 1 unpaid bank transfer order(s).')
        ->expectsOutput('Automatically cancelled 1 unpaid cash on delivery order(s).')
        ->assertSuccessful();

    // 7. Verify order statuses
    expect((string) $oldBankTransfer->fresh()->status)->toBe(OrderStatusEnum::CANCELLED->value);
    expect((string) $newBankTransfer->fresh()->status)->toBe(OrderStatusEnum::AWAITING->value);
    expect((string) $oldCOD->fresh()->status)->toBe(OrderStatusEnum::CANCELLED->value);
    expect((string) $newCOD->fresh()->status)->toBe(OrderStatusEnum::PENDING->value);
});
