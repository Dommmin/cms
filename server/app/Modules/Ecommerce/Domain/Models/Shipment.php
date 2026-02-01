<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Enums\ShipmentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Shipment extends Model
{
    protected $table = 'shipments';

    protected $fillable = [
        'order_id', 'shipping_method_id', 'carrier', 'tracking_number',
        'label_url', 'status', 'pickup_point_id', 'carrier_payload',
    ];

    protected $casts = [
        'status'         => ShipmentStatus::class,
        'carrier_payload' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }
}

