<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ReturnStatusEnum;
use App\Enums\ReturnTypeEnum;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $reference_number
 * @property ReturnTypeEnum $return_type
 * @property ReturnStatusEnum $status
 * @property string|null $reason
 * @property string|null $customer_notes
 * @property string|null $admin_notes
 * @property int|null $refund_amount
 * @property string|null $return_tracking_number
 * @property Carbon $created_at
 * @property Collection $items
 * @property-read Order $order
 * @property int $order_id
 * @property string|null $return_label_url
 * @property CarbonImmutable|null $updated_at
 * @property-read int|null $items_count
 * @property-read Collection<int, ReturnStatusHistory> $statusHistory
 * @property-read int|null $status_history_count
 *
 * @method static Builder<static>|ReturnRequest newModelQuery()
 * @method static Builder<static>|ReturnRequest newQuery()
 * @method static Builder<static>|ReturnRequest query()
 * @method static Builder<static>|ReturnRequest whereAdminNotes($value)
 * @method static Builder<static>|ReturnRequest whereCreatedAt($value)
 * @method static Builder<static>|ReturnRequest whereCustomerNotes($value)
 * @method static Builder<static>|ReturnRequest whereId($value)
 * @method static Builder<static>|ReturnRequest whereOrderId($value)
 * @method static Builder<static>|ReturnRequest whereReason($value)
 * @method static Builder<static>|ReturnRequest whereReferenceNumber($value)
 * @method static Builder<static>|ReturnRequest whereRefundAmount($value)
 * @method static Builder<static>|ReturnRequest whereReturnLabelUrl($value)
 * @method static Builder<static>|ReturnRequest whereReturnTrackingNumber($value)
 * @method static Builder<static>|ReturnRequest whereReturnType($value)
 * @method static Builder<static>|ReturnRequest whereStatus($value)
 * @method static Builder<static>|ReturnRequest whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'order_id', 'reference_number', 'return_type', 'status',
    'reason', 'customer_notes', 'admin_notes',
    'return_tracking_number', 'return_label_url', 'refund_amount',
])]
#[Table(name: 'returns')]
class ReturnRequest extends Model
{
    use HasFactory;

    protected $casts = [
        'return_type' => ReturnTypeEnum::class,
        'status' => ReturnStatusEnum::class,
    ];

    public static function generateReferenceNumber(): string
    {
        $year = date('Y');
        $number = self::query()->where('reference_number', 'like', sprintf('RET-%s-%%', $year))
            ->count() + 1;

        return sprintf('RET-%s-%05d', $year, $number);
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return HasMany<ReturnItem, $this>
     */
    /**
     * @return HasMany<ReturnItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(ReturnItem::class, 'return_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ReturnStatusHistory::class, 'return_id')->latest('changed_at');
    }

    public function changeStatus(ReturnStatusEnum $newStatus, string $changedBy = 'system', ?string $notes = null): void
    {
        $previousStatus = $this->status->value;

        $this->update(['status' => $newStatus->value]);

        $this->statusHistory()->create([
            'previous_status' => $previousStatus,
            'new_status' => $newStatus->value,
            'changed_by' => $changedBy,
            'notes' => $notes,
            'changed_at' => now(),
        ]);
    }
}
