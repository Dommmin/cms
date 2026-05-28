<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ShipmentStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
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
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ShipmentItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\ShippingMethod|null $shippingMethod
 * @method static \Database\Factories\ShipmentFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereCarrier($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereCarrierPayload($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereLabelUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment wherePickupPointId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereProviderShipmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereShippingMethodId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereTrackingNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereTrackingUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shipment whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'order_id', 'shipping_method_id', 'carrier', 'provider_shipment_id',
    'tracking_number', 'tracking_url', 'label_url', 'status', 'pickup_point_id', 'carrier_payload',
])]
#[Table(name: 'shipments')]
class Shipment extends Model
{
    use HasFactory;

    protected $casts = [
        'status' => ShipmentStatusEnum::class,
        'carrier_payload' => 'array',
    ];

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
}
