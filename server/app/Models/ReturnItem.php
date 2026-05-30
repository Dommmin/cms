<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ReturnItemConditionEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $return_id
 * @property int $order_item_id
 * @property int $quantity
 * @property ReturnItemConditionEnum|null $condition
 * @property string|null $notes
 * @property-read OrderItem $orderItem
 * @property-read ReturnRequest $return
 *
 * @method static Builder<static>|ReturnItem newModelQuery()
 * @method static Builder<static>|ReturnItem newQuery()
 * @method static Builder<static>|ReturnItem query()
 * @method static Builder<static>|ReturnItem whereCondition($value)
 * @method static Builder<static>|ReturnItem whereId($value)
 * @method static Builder<static>|ReturnItem whereNotes($value)
 * @method static Builder<static>|ReturnItem whereOrderItemId($value)
 * @method static Builder<static>|ReturnItem whereQuantity($value)
 * @method static Builder<static>|ReturnItem whereReturnId($value)
 *
 * @mixin Model
 */
#[Fillable([
    'return_id', 'order_item_id', 'quantity', 'condition', 'notes',
])]
#[Table(name: 'return_items')]
#[WithoutTimestamps]
class ReturnItem extends Model
{
    use HasFactory;

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
