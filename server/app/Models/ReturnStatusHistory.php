<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $return_id
 * @property string $previous_status
 * @property string $new_status
 * @property string $changed_by
 * @property string|null $notes
 * @property \Carbon\CarbonImmutable $changed_at
 * @property-read \App\Models\ReturnRequest $return
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnStatusHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnStatusHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnStatusHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnStatusHistory whereChangedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnStatusHistory whereChangedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnStatusHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnStatusHistory whereNewStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnStatusHistory whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnStatusHistory wherePreviousStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnStatusHistory whereReturnId($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'return_id', 'previous_status', 'new_status',
    'changed_by', 'notes', 'changed_at',
])]
#[Table(name: 'return_status_history')]
class ReturnStatusHistory extends Model
{
    use HasFactory;

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function return(): BelongsTo
    {
        return $this->belongsTo(ReturnRequest::class, 'return_id');
    }
}
