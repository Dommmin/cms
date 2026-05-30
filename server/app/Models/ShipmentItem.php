<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $shipment_id
 * @property int $order_item_id
 * @property int $quantity
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read OrderItem $orderItem
 * @property-read Shipment $shipment
 *
 * @method static Builder<static>|ShipmentItem newModelQuery()
 * @method static Builder<static>|ShipmentItem newQuery()
 * @method static Builder<static>|ShipmentItem query()
 * @method static Builder<static>|ShipmentItem whereCreatedAt($value)
 * @method static Builder<static>|ShipmentItem whereId($value)
 * @method static Builder<static>|ShipmentItem whereOrderItemId($value)
 * @method static Builder<static>|ShipmentItem whereQuantity($value)
 * @method static Builder<static>|ShipmentItem whereShipmentId($value)
 * @method static Builder<static>|ShipmentItem whereUpdatedAt($value)
 *
 * @mixin Model
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
