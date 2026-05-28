<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $shipment_id
 * @property int $order_item_id
 * @property int $quantity
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\OrderItem $orderItem
 * @property-read \App\Models\Shipment $shipment
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShipmentItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShipmentItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShipmentItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShipmentItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShipmentItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShipmentItem whereOrderItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShipmentItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShipmentItem whereShipmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShipmentItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable(['shipment_id', 'order_item_id', 'quantity'])]
#[Table(name: 'shipment_items')]
class ShipmentItem extends Model
{
    use HasFactory;

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
