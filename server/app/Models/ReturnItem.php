<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ReturnItemConditionEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnItem extends Model
{
    use HasFactory;

    protected $table = 'return_items';

    public $timestamps = false;

    protected $fillable = [
        'return_id', 'order_item_id', 'quantity', 'condition', 'notes',
    ];

    protected $casts = [
        'condition' => ReturnItemConditionEnum::class,
    ];

    public function return(): BelongsTo
    {
        return $this->belongsTo(ReturnRequest::class, 'return_id');
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
