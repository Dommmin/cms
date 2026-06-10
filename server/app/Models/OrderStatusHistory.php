<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Builder;
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
 * @property CarbonImmutable $changed_at
 * @property-read Order $order
 *
 * @method static Builder<static>|OrderStatusHistory newModelQuery()
 * @method static Builder<static>|OrderStatusHistory newQuery()
 * @method static Builder<static>|OrderStatusHistory query()
 * @method static Builder<static>|OrderStatusHistory whereChangedAt($value)
 * @method static Builder<static>|OrderStatusHistory whereChangedBy($value)
 * @method static Builder<static>|OrderStatusHistory whereChangedByUserId($value)
 * @method static Builder<static>|OrderStatusHistory whereId($value)
 * @method static Builder<static>|OrderStatusHistory whereNewStatus($value)
 * @method static Builder<static>|OrderStatusHistory whereNotes($value)
 * @method static Builder<static>|OrderStatusHistory whereOrderId($value)
 * @method static Builder<static>|OrderStatusHistory wherePreviousStatus($value)
 *
 * @mixin Model
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

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    protected function casts(): array
    {
        return [
            'changed_at' => 'datetime',
        ];
    }
}
