<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property string $previous_status
 * @property string $new_status
 * @property string $changed_by
 * @property int|null $changed_by_user_id
 * @property string|null $notes
 * @property \Carbon\CarbonImmutable $changed_at
 * @property-read \App\Models\Order $order
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory whereChangedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory whereChangedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory whereChangedByUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory whereNewStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderStatusHistory wherePreviousStatus($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'order_id', 'previous_status', 'new_status',
    'changed_by', 'changed_by_user_id', 'notes', 'changed_at',
])]
#[Table(name: 'order_status_history')]
#[WithoutTimestamps]
class OrderStatusHistory extends Model
{
    use HasFactory;

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
