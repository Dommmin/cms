# Fulfillment Workflow

## Order State Machine

Current states (from `spatie/laravel-model-states`):

```
AwaitingPayment → Pending → Processing → Shipped → Delivered
                                    ↓
                                Cancelled
                                    ↓
                                Refunded
```

## Fulfillment Workflow Enhancement

### New Order States

```php
// app/Enums/OrderStatusEnum.php

class OrderStatusEnum extends Enum
{
    // Existing
    case AWAITING_PAYMENT = 'awaiting_payment';
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';
    case REFUNDED = 'refunded';
    
    // New fulfillment states
    case PICKING = 'picking';      // Warehouse is picking items
    case PACKED = 'packed';        // Items packed, ready for pickup
    case READY = 'ready';          // Ready for carrier pickup
}
```

### Workflow Transitions

```
Processing → Picking (when warehouse starts)
Picking → Packed (when all items collected)
Packed → Ready (when package sealed)
Ready → Shipped (when carrier collects)
```

### Implementation

```php
// app/Actions/StartPicking.php
class StartPicking
{
    public function handle(Order $order): void
    {
        if (!$order->status->canTransitionTo(OrderStatusEnum::PICKING)) {
            throw new \Exception('Cannot start picking');
        }
        
        $order->status->transitionTo(OrderStatusEnum::PICKING);
        $order->update(['picking_started_at' => now()]);
        
        event(new OrderPickingStarted($order));
    }
}

// app/Actions/MarkAsPacked.php
class MarkAsPacked
{
    public function handle(Order $order, array $items): void
    {
        $order->status->transitionTo(OrderStatusEnum::PACKED);
        $order->update(['packed_at' => now()]);
        
        // Store packed items weights/dimensions
        foreach ($items as $item) {
            OrderPackItem::create([
                'order_id' => $order->id,
                'product_variant_id' => $item['variant_id'],
                'weight' => $item['weight'],
                'dimensions' => $item['dimensions'],
            ]);
        }
        
        event(new OrderPacked($order));
    }
}
```

### Admin UI

Add buttons in order detail page:

- `Start Picking` → transitions to `picking`
- `Mark as Packed` → shows modal to enter weights
- `Mark as Ready` → transitions to `ready`, generates shipping label
- `Ship` → enters tracking number, transitions to `shipped`

### Notifications

```
picking → notify warehouse team
packed → notify shipping manager
ready → notify carrier via webhook
shipped → notify customer with tracking
delivered → notify customer, request review
```

### Time Tracking

Each state transition logs timestamp:

```php
// migration
$table->timestamp('picking_started_at')->nullable();
$table->timestamp('packed_at')->nullable();
$table->timestamp('ready_for_pickup_at')->nullable();
```

This enables:
- Warehouse efficiency analytics
- Average picking/packing time
- Carrier pickup scheduling

### Future Enhancements

1. **Barcodescanning**: Scan items during picking
2. **Photo verification**: Photo of packed box before shipping
3. **Weight validation**: Compare actual vs expected weight
4. **Multi-package**: Split order into multiple shipments
5. **Reserve inventory**: Lock items during picking
