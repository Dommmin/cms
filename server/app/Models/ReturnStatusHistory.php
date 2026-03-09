<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnStatusHistory extends Model
{
    use HasFactory;

    protected $table = 'return_status_history';

    protected $fillable = [
        'return_id', 'previous_status', 'new_status',
        'changed_by', 'notes', 'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function return(): BelongsTo
    {
        return $this->belongsTo(ReturnRequest::class, 'return_id');
    }
}
