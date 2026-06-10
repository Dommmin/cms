<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ShipmentStatusEnum;
use Carbon\CarbonImmutable;
use Database\Factories\ShipmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string|null $tracking_url
 * @property int $order_id
 * @property int|null $shipping_method_id
 * @property string|null $carrier
 * @property string|null $provider_shipment_id
 * @property string|null $tracking_number
 * @property string|null $label_url
 * @property ShipmentStatusEnum $status
 * @property string|null $pickup_point_id
 * @property array<array-key, mixed>|null $carrier_payload
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ShipmentItem> $items
 * @property-read int|null $items_count
 * @property-read Order $order
 * @property-read ShippingMethod|null $shippingMethod
 *
 * @method static ShipmentFactory factory($count = null, $state = [])
 * @method static Builder<static>|Shipment newModelQuery()
 * @method static Builder<static>|Shipment newQuery()
 * @method static Builder<static>|Shipment query()
 * @method static Builder<static>|Shipment whereCarrier($value)
 * @method static Builder<static>|Shipment whereCarrierPayload($value)
 * @method static Builder<static>|Shipment whereCreatedAt($value)
 * @method static Builder<static>|Shipment whereId($value)
 * @method static Builder<static>|Shipment whereLabelUrl($value)
 * @method static Builder<static>|Shipment whereOrderId($value)
 * @method static Builder<static>|Shipment wherePickupPointId($value)
 * @method static Builder<static>|Shipment whereProviderShipmentId($value)
 * @method static Builder<static>|Shipment whereShippingMethodId($value)
 * @method static Builder<static>|Shipment whereStatus($value)
 * @method static Builder<static>|Shipment whereTrackingNumber($value)
 * @method static Builder<static>|Shipment whereTrackingUrl($value)
 * @method static Builder<static>|Shipment whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'order_id', 'shipping_method_id', 'carrier', 'provider_shipment_id',
    'tracking_number', 'tracking_url', 'label_url', 'status', 'pickup_point_id', 'carrier_payload',
])]
#[Table(name: 'shipments')]
class Shipment extends Model
{
    use HasFactory;

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ShipmentItem::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    protected function casts(): array
    {
        return [
            'status' => ShipmentStatusEnum::class,
            'carrier_payload' => 'array',
        ];
    }
}
