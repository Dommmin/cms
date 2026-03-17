<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ShipmentStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shipment extends Model
{
    use HasFactory;

    protected $table = 'shipments';

    protected $fillable = [
        'order_id', 'shipping_method_id', 'carrier', 'provider_shipment_id',
        'tracking_number', 'label_url', 'status', 'pickup_point_id', 'carrier_payload',
    ];

    protected $casts = [
        'status' => ShipmentStatusEnum::class,
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
