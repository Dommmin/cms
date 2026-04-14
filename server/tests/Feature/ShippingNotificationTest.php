<?php

declare(strict_types=1);

use App\Enums\OrderStatusEnum;
use App\Events\OrderShipped;
use App\Listeners\SendShippingNotification;
use App\Models\Customer;
use App\Models\EmailTemplate;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Services\SmsService;
use App\States\Order\ProcessingState;
use Database\Seeders\CurrencySeeder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\seed;

beforeEach(function (): void {
    seed(CurrencySeeder::class);
});

it('OrderShipped event holds the order instance', function (): void {
    $order = Order::factory()->create();

    $event = new OrderShipped($order);

    expect($event->order)->toBeInstanceOf(Order::class)
        ->and($event->order->id)->toBe($order->id);
});

it('SendShippingNotification listener implements ShouldQueue', function (): void {
    expect(is_a(SendShippingNotification::class, ShouldQueue::class, true))->toBeTrue();
});

it('fires OrderShipped event when order status changes to shipped', function (): void {
    Event::fake();

    $order = Order::factory()->create(['status' => ProcessingState::class]);

    $order->changeStatus(OrderStatusEnum::SHIPPED);

    Event::assertDispatched(OrderShipped::class, fn (OrderShipped $event): bool => $event->order->id === $order->id);
});

it('does not fire OrderShipped when status changes to delivered', function (): void {
    Event::fake();

    // Create a shipped order and transition to delivered — OrderShipped should NOT fire again
    $order = Order::factory()->shipped()->create();

    $order->changeStatus(OrderStatusEnum::DELIVERED);

    Event::assertNotDispatched(OrderShipped::class);
});

it('SendShippingNotification handle sends email via Mail::html when active template exists', function (): void {
    EmailTemplate::factory()->create([
        'key' => 'order.shipped',
        'subject' => 'Order {{reference}} shipped',
        'body' => '<p>Tracking: {{tracking}}</p>',
        'is_active' => true,
    ]);

    $user = User::factory()->create(['email' => 'customer@example.com']);
    $customer = Customer::factory()->create([
        'user_id' => $user->id,
        'phone' => null,
    ]);
    $order = Order::factory()->create(['customer_id' => $customer->id]);

    $shippingMethod = ShippingMethod::factory()->create();
    Shipment::factory()->create([
        'order_id' => $order->id,
        'shipping_method_id' => $shippingMethod->id,
        'tracking_number' => 'TRK123',
    ]);

    Mail::shouldReceive('html')
        ->once()
        ->withArgs(fn (string $body, Closure $callback): bool => str_contains($body, 'TRK123'));

    $smsService = Mockery::mock(SmsService::class);
    $smsService->shouldNotReceive('send');

    $listener = new SendShippingNotification($smsService);
    $listener->handle(new OrderShipped($order));
});

it('SendShippingNotification handle skips email when no active template exists', function (): void {
    $user = User::factory()->create(['email' => 'customer@example.com']);
    $customer = Customer::factory()->create([
        'user_id' => $user->id,
        'phone' => null,
    ]);
    $order = Order::factory()->create(['customer_id' => $customer->id]);

    Mail::shouldReceive('html')->never();

    $smsService = Mockery::mock(SmsService::class);
    $smsService->shouldNotReceive('send');

    $listener = new SendShippingNotification($smsService);
    $listener->handle(new OrderShipped($order));
});

it('SendShippingNotification handle sends SMS when customer has phone and shipment has tracking', function (): void {
    EmailTemplate::factory()->create([
        'key' => 'order.shipped',
        'subject' => 'Shipped',
        'body' => '<p>body</p>',
        'is_active' => true,
    ]);

    $user = User::factory()->create(['email' => 'sms@example.com']);
    $customer = Customer::factory()->create([
        'user_id' => $user->id,
        'phone' => '+48500000000',
    ]);
    $order = Order::factory()->create(['customer_id' => $customer->id]);

    $shippingMethod = ShippingMethod::factory()->create();
    Shipment::factory()->create([
        'order_id' => $order->id,
        'shipping_method_id' => $shippingMethod->id,
        'tracking_number' => 'SMSTRACK99',
    ]);

    Mail::shouldReceive('html')->once();

    $smsService = Mockery::mock(SmsService::class);
    $smsService->shouldReceive('send')
        ->once()
        ->with('+48500000000', Mockery::on(fn (string $msg): bool => str_contains($msg, 'SMSTRACK99')));

    $listener = new SendShippingNotification($smsService);
    $listener->handle(new OrderShipped($order));
});

it('SendShippingNotification handle uses guest email when no customer user exists', function (): void {
    EmailTemplate::factory()->create([
        'key' => 'order.shipped',
        'subject' => 'Shipped {{reference}}',
        'body' => '<p>body</p>',
        'is_active' => true,
    ]);

    $order = Order::factory()->create([
        'customer_id' => null,
        'guest_email' => 'guest@example.com',
    ]);

    Mail::shouldReceive('html')
        ->once()
        ->withArgs(function (string $body, Closure $callback): bool {
            $message = Mockery::mock(Message::class);
            $message->shouldReceive('to')->with('guest@example.com')->once()->andReturnSelf();
            $message->shouldReceive('subject')->once()->andReturnSelf();
            $callback($message);

            return true;
        });

    $smsService = Mockery::mock(SmsService::class);
    $smsService->shouldNotReceive('send');

    $listener = new SendShippingNotification($smsService);
    $listener->handle(new OrderShipped($order));
});
