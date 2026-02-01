<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Enums\ReturnItemCondition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ReturnItem extends Model
{
    protected $table = 'return_items';

    protected $fillable = [
        'return_id', 'order_item_id', 'quantity', 'condition', 'notes',
    ];

    protected $casts = [
        'condition' => ReturnItemCondition::class,
    ];

    public function return(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Ecommerce\Domain\Models\ReturnRequest::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}

