<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Enums\ReturnStatus;
use App\Enums\ReturnType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class ReturnRequest extends Model
{
    protected $table = 'returns';

    protected $fillable = [
        'order_id', 'reference_number', 'return_type', 'status',
        'reason', 'customer_notes', 'admin_notes',
        'return_tracking_number', 'return_label_url', 'refund_amount',
    ];

    protected $casts = [
        'return_type' => ReturnType::class,
        'status'      => ReturnStatus::class,
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReturnItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ReturnStatusHistory::class)->orderByDesc('changed_at');
    }

    public function changeStatus(ReturnStatus $newStatus, string $changedBy = 'system', ?string $notes = null): void
    {
        $previousStatus = $this->status->value;

        $this->update(['status' => $newStatus->value]);

        $this->statusHistory()->create([
            'previous_status' => $previousStatus,
            'new_status'      => $newStatus->value,
            'changed_by'      => $changedBy,
            'notes'           => $notes,
            'changed_at'      => now(),
        ]);
    }

    public static function generateReferenceNumber(): string
    {
        $year   = date('Y');
        $number = self::where('reference_number', 'like', "RET-{$year}-%")
            ->count() + 1;

        return sprintf('RET-%s-%05d', $year, $number);
    }
}

// Alias for backward compatibility
class_alias(\App\Modules\Ecommerce\Domain\Models\ReturnRequest::class, \App\Modules\Ecommerce\Domain\Models\Return::class);

