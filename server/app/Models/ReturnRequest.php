<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ReturnStatusEnum;
use App\Enums\ReturnTypeEnum;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $reference_number
 * @property string $return_type
 * @property string $status
 * @property string|null $reason
 * @property string|null $customer_notes
 * @property string|null $admin_notes
 * @property int|null $refund_amount
 * @property string|null $return_tracking_number
 * @property Carbon $created_at
 * @property Collection $items
 * @property-read Order $order
 */
class ReturnRequest extends Model
{
    use HasFactory;

    protected $table = 'returns';

    protected $fillable = [
        'order_id', 'reference_number', 'return_type', 'status',
        'reason', 'customer_notes', 'admin_notes',
        'return_tracking_number', 'return_label_url', 'refund_amount',
    ];

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

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReturnItem::class, 'return_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ReturnStatusHistory::class)->latest('changed_at');
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
